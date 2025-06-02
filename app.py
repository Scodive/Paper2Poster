from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import tempfile
import shutil
from werkzeug.utils import secure_filename
import uuid
import subprocess
import sys
import threading
import time
import json

app = Flask(__name__)
CORS(app)

# 配置上传限制
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 全局状态管理
generation_status = {}

def run_poster_generation(task_id, pdf_path, model_t='4o', model_v='4o'):
    """在后台运行海报生成"""
    try:
        generation_status[task_id] = {'status': 'processing', 'progress': 0, 'message': '开始处理...'}
        
        # 创建临时目录结构
        paper_dir = os.path.dirname(pdf_path)
        paper_name = os.path.basename(paper_dir)
        
        # 设置环境变量
        env = os.environ.copy()
        
        generation_status[task_id]['progress'] = 10
        generation_status[task_id]['message'] = '解析论文中...'
        
        # 构建命令
        cmd = [
            sys.executable, '-m', 'PosterAgent.new_pipeline',
            '--poster_path', pdf_path,
            '--model_name_t', model_t,
            '--model_name_v', model_v,
            '--poster_width_inches', '48',
            '--poster_height_inches', '36',
            '--tmp_dir', os.path.join(paper_dir, 'tmp')
        ]
        
        generation_status[task_id]['progress'] = 20
        generation_status[task_id]['message'] = '生成布局中...'
        
        # 运行PosterAgent pipeline
        process = subprocess.run(cmd, capture_output=True, text=True, env=env, cwd=os.getcwd())
        
        if process.returncode != 0:
            raise Exception(f"PosterAgent执行失败: {process.stderr}")
        
        generation_status[task_id]['progress'] = 90
        generation_status[task_id]['message'] = '生成完成，准备下载...'
        
        # 查找生成的PPT文件
        output_pattern = f'<{model_t}_{model_v}>_generated_posters'
        output_dir = None
        for root, dirs, files in os.walk('.'):
            for dir_name in dirs:
                if dir_name.startswith(output_pattern):
                    potential_output = os.path.join(root, dir_name, paper_name)
                    if os.path.exists(potential_output):
                        output_dir = potential_output
                        break
            if output_dir:
                break
        
        if not output_dir:
            raise Exception("找不到生成的海报文件")
        
        # 查找PPT文件
        pptx_files = [f for f in os.listdir(output_dir) if f.endswith('.pptx')]
        if not pptx_files:
            raise Exception("未找到生成的PPT文件")
        
        pptx_path = os.path.join(output_dir, pptx_files[0])
        
        generation_status[task_id] = {
            'status': 'completed',
            'progress': 100,
            'message': '海报生成成功！',
            'result_path': pptx_path
        }
        
    except Exception as e:
        generation_status[task_id] = {
            'status': 'failed',
            'progress': 100,
            'message': f'生成失败: {str(e)}'
        }

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': '没有上传文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': '只支持PDF文件'}), 400
    
    try:
        # 生成唯一任务ID
        task_id = str(uuid.uuid4())
        
        # 创建工作目录
        work_dir = os.path.join('uploads', task_id)
        os.makedirs(work_dir, exist_ok=True)
        
        # 保存PDF文件
        pdf_path = os.path.join(work_dir, 'paper.pdf')
        file.save(pdf_path)
        
        # 获取模型配置
        model_t = request.form.get('model_t', '4o')
        model_v = request.form.get('model_v', '4o')
        
        # 启动后台生成任务
        thread = threading.Thread(
            target=run_poster_generation,
            args=(task_id, pdf_path, model_t, model_v)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'task_id': task_id,
            'message': '文件上传成功，开始生成海报...'
        })
        
    except Exception as e:
        return jsonify({'error': f'上传失败: {str(e)}'}), 500

@app.route('/status/<task_id>')
def get_status(task_id):
    """获取生成状态"""
    if task_id not in generation_status:
        return jsonify({'error': '任务不存在'}), 404
    
    return jsonify(generation_status[task_id])

@app.route('/download/<task_id>')
def download_poster(task_id):
    """下载生成的海报"""
    if task_id not in generation_status:
        return jsonify({'error': '任务不存在'}), 404
    
    status = generation_status[task_id]
    if status['status'] != 'completed':
        return jsonify({'error': '海报还未生成完成'}), 400
    
    if 'result_path' not in status or not os.path.exists(status['result_path']):
        return jsonify({'error': '海报文件不存在'}), 404
    
    return send_file(
        status['result_path'],
        as_attachment=True,
        download_name='poster.pptx',
        mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    # 确保必要目录存在
    os.makedirs('uploads', exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 