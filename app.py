from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
from flask_cors import CORS
from googletrans import Translator

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

@app.route('/summary', methods=['POST'])  # Specify the allowed HTTP methods
def summary_api():
    # url = request.args.get('url', '')
    # video_id = url.split('=')[1]
    # print(video_id)
    data = request.get_json()
    video_id = data['url'].split('=')[1]
    language = data['language']
    summary = get_summary(get_transcript(video_id), language)
    return summary, 200

def get_transcript(video_id):
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    transcript = ''
    transcripted = ' '.join([d['text'] for d in transcript_list])
    transcript= transcripted
    
    
    return transcript

def get_summary(transcript, language):
    summariser = pipeline('summarization')
    summary = ''

    # Maximum sequence length supported by the model
    max_sequence_length = 1024

    # Define the chunk size and overlap
    chunk_size = max_sequence_length - 50  # Adjust as needed
    overlap = 50  # Adjust as needed

    # Split the transcript into smaller chunks with overlap
    chunks = [transcript[i:i + chunk_size] for i in range(0, len(transcript), chunk_size - overlap)]

    for chunk in chunks:
        # Generate a summary for the current chunk
        chunk_summary = summariser(chunk, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)

        # Check if the summarizer produced any output
        if chunk_summary:
            summary_text = chunk_summary[0]['summary_text']
            summary += summary_text + ' '

    translator = Translator()
    try:
        if language == 'english':
            summary = summary
        elif language == 'hindi':
            translation = translator.translate(summary, dest='hi')
            if translation:
                summary = translation.text
        elif language == 'telugu':
            translation = translator.translate(summary, dest='te')
            if translation:
                summary = translation.text
    except Exception as e:
        # Handle the exception (e.g., log the error or provide a fallback)
        summary = "Translation error: " + str(e)

    return {'summary': summary}



    

if __name__ == '__main__':
    app.run()