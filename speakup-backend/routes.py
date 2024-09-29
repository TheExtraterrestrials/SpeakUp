# routes.py
from flask import Blueprint, request, jsonify
import os
from langchain.chains import ConversationChain
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.pydantic_v1 import BaseModel, Field
from flask import Blueprint, request, jsonify
import soundfile as sf
import io
from groq import Groq

os.environ['GROQ_API_KEY'] = "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"
# Initialize Groq client and create a Blueprint for routes
client = Groq()
routes = Blueprint('routes', __name__)

def transcribe_audio_in_memory(audio_data):
    """Send the audio data directly to Groq API for transcription."""
    with io.BytesIO() as flac_buffer:
        # Convert the audio to FLAC format
        sf.write(flac_buffer, audio_data, 16000, format='FLAC')
        flac_buffer.seek(0)

        # Transcribe using Groq API
        transcription = client.audio.transcriptions.create(
            file=("audio.flac", flac_buffer),
            model="distil-whisper-large-v3-en",
            language="en",
        )
        return transcription.text

@routes.route('/transcribe', methods=['POST'])
def transcribe():
    """Route to handle audio transcription."""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    
    # Read audio data from the file
    audio_data, sample_rate = sf.read(audio_file)
    
    # Transcribe the audio
    transcription = transcribe_audio_in_memory(audio_data)
    
    return jsonify({"transcription": transcription})



# Define the model for response suggestions
class ResponseSuggestion(BaseModel):
    suggestion: str = Field(description="The suggested rephrased response for the user")

# Initialize Groq model for the conversation and suggestion
model_name = 'llama-3.1-8b-instant'

# Initialize ChatGroq for conversation
memory = ConversationBufferWindowMemory(k=5)
groq_chat = ChatGroq(
    groq_api_key=os.environ['GROQ_API_KEY'], 
    model_name=model_name
)

# Initialize prompt for conversation
conversation_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a highly skilled and compassionate speech therapist integrated within an application. Your role is to assist users with speech disorders through natural, engaging conversations while incorporating proven speech therapy techniques, including Cognitive Behavioral Therapy (CBT), articulation exercises, and fluency-shaping techniques. You should subtly encourage users to practice without making the session feel clinical or formal. Always focus on improving speech patterns, confidence, and expression while creating an enjoyable and supportive environment. Guide the user gently, use open-ended questions, and bring up topics of interest to the user to maintain engagement. Avoid overwhelming them with long responses or deviating from the purpose of helping improve their speech. Keep the convo very short."),
        ("human", "message history: {history} current input: {user_input}")
    ]
)

# Initialize the conversation chain with the prompt and memory
conversation_chain = ConversationChain(
    llm=groq_chat,
    memory=memory,
    prompt=conversation_prompt,
    input_key="user_input"
)

# Define the suggestion system prompt
suggestion_system_prompt = """You are an AI Assistant focused on helping users improve their communication. 
Your task is to evaluate the last response given by the user in the chat history. 
Instead of answering the question, provide a suggestion on how the user could have phrased their query more effectively. 
If the user's original phrasing is already good, respond with 'Great response!'. Your output should only include the suggested rephrased query or the applause message, without any additional explanation or context."""

# Initialize ChatGroq for suggestions
suggestion_llm = ChatGroq(temperature=0, model_name=model_name)

# Set up the structured output for response suggestions
structured_llm_response_suggestion = suggestion_llm.with_structured_output(ResponseSuggestion)

# Create the suggestion prompt template
suggestion_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", suggestion_system_prompt),
        ("human", "User: {question}"),
    ]
)

# Combine the prompt with the structured output
response_suggestion = suggestion_prompt | structured_llm_response_suggestion

# Route for handling conversation
@routes.route('/conversation', methods=['POST'])
def conversation():
    user_input = request.json.get('user_input')
    if not user_input:
        return jsonify({'error': 'User input is required'}), 400

    # Run the conversation chain with the user input
    response = conversation_chain.run({"user_input": user_input})
    return jsonify({'response': response})

# Route for handling suggestions
@routes.route('/suggestion', methods=['POST'])
def suggestion():
    question = request.json.get('question')
    if not question:
        return jsonify({'error': 'Question is required'}), 400

    # Run the suggestion response
    suggestion_output = response_suggestion.invoke(question)
    return jsonify({'suggestion': suggestion_output.suggestion})
