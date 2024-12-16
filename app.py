from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
from difflib import get_close_matches

app = Flask(__name__, static_folder="static")

# Sample data for questions and answers
qa_data = [
    ["what is whitespacesAI?", "WhitespacesAI is a research & product development technology pioneer. Working with the next-gen companies in bringing AI revolution in business across industries like Fintech, Financial services, Consumer goods, Insurance, Healthcare, BFSI, Edtech, Logistics & supply chain, and others."],
    [
    "What are the technology services whitespaces work on?", 
    "Digital Transformation: Enabling businesses to adapt to new digital technologies\n"
    "Mobile Application Development: Native iOS & Android, React Native, Flutter\n"
    "Web Application Development: Responsive web apps, modern frameworks\n"
    "Software Development: Custom software solutions for businesses\n"
    "Artificial Intelligence: Building AI-driven applications and solutions\n"
    "Machine Learning: Developing models for prediction and analytics\n"
    "Blockchain Development: Implementing blockchain for secure and transparent solutions"
    ],
     ["What are the technology stacks whitespaces work on?",
     "Frontend Development: ReactJS, UI/UX Design, React Native, Flutter, Native iOS & Android, NextJS\n"
     "Backend Development: NodeJS, Python, Java, LAMP Stack (Linux, Apache, MySQL, PHP)\n"
     "Databases: MongoDB, MySQL (part of LAMP Stack)\n"
     "AI/ML and Generative AI: Python (for AI/ML applications), AI/ML, GenerativeAI\n"
     "Full-Stack Development: MERN Stack (MongoDB, ExpressJS, ReactJS, NodeJS), NextJS (frontend and backend capabilities)\n"
     "Cloud and DevOps: AWS (Amazon Web Services), GCP (Google Cloud Platform), Azure (Microsoft Cloud Platform)"],
    

    ["Who does whitespaces work with?", "We work predominantly with start-ups in being their tech partners and we also work with large enterprise clients on large tech projects."],
    ["What is our mission?", "Our mission is to build great products with founders and bring AI into every business through our impactful innovative projects."],
    ["Why do we work largely with startups?", "Our founder has immense experience in the startup ecosystem and we strongly believe it is new-age startups that are going to revolutionize the industry and make bigger impacts in the world and innovation is the way to an impactful business."],
    ["How many projects have we worked on?", "We have built more than 35+ MVPs in the last 10 months and delivered over 18+ projects across building web applications, mobile applications, websites, software applications & other developments."],
    ["Who are the cofounders?", "WhitespacesAI was founded by Mr.BR with cofounders Mr. Dennis and Mr. Naidu with a mission to impact the next-gen business with AI & deep-tech."],
    ["What are the products that they offer?", "WhitespacesAI offers a wide range of industry-specific GenAI product suites specific to industry use cases such as - Kriya AI, OCR AI, Cloud AI, and their flagship Agent Iksha for enterprises. All these products could largely be customizable for your specific business use case."],
    ["Who are your clients?", "Our clients are predominantly across Healthcare, BFSI, & FMCG sectors largely driven by our services around digital transformation & AI."],
    ["Name of our clients?", "Raha, Frissly, Organic Place, OG Technologies, Urban Basics, Summer Moon, and others."],
    ["How many employees do you have?", "We are over 45+ and counting with passionate individuals ranging from top colleges in India to highly experienced industry experts across AI, Data, & Digital Transformation."],
    ["Who are your partners?", "We are officially partners with NVIDIA as their Inception Partner, AWS Startup Partner, & GCP Start-up Partner, and also Startup India-recognized AI company."]
]
qa_df = pd.DataFrame(qa_data, columns=["Questions", "Answers"])

# Services provided by WhitespacesAI
services_data = [
    "Digital transformation across Mobile application development",
    "Web application development",
    "Software development",
    "Artificial intelligence",
    "Machine learning",
    "Blockchain development"
]

# Convert the QA dataframe to a dictionary
qa_dict = dict(zip(qa_df["Questions"], qa_df["Answers"]))

def get_closest_match(query, options):
    matches = get_close_matches(query, options, n=1, cutoff=0.5)
    return matches[0] if matches else None

def suggest_follow_up(user_query):
    suggestions = []
    if "whitespacesai" in user_query.lower():
        suggestions = [
            "What are your services?",
            # "What is your mission?",
            "Who are your clients?"
        ]
    elif "hey" or "Hi" or "Good morning" in user_query.lower():
        suggestions = [
            "What is WhitespacesAI?"
            "What are our services?"
            "What are our Products?"
        ]
    elif "services" in user_query.lower():
        suggestions = [
            "What technology stacks do you use?",
            "What products do you offer?",
            # "Who are your clients?"
        ]
    elif "technology" in user_query.lower() or "stack" in user_query.lower():
        suggestions = [
            "What is your approach to AI?",
            "What kind of projects do you work on?"
        ]
    elif "clients" in user_query.lower():
        suggestions = [
            "Who are the cofounders?",
            # "What are your services?",
            "What products do you offer?"
        ]
    elif "products" in user_query.lower():
        suggestions = [
            "What technologies do you use?",
            "How do your products impact businesses?"
        ]
    return suggestions

def create_hyperlink(text, url):
    return f'<a href="{url}" target="_blank">{text}</a>'

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/ask', methods=['POST'])
def handle_query():
    data = request.json
    user_query = data.get('query', '').strip().lower()
    normalized_query = user_query.lower()
    closest_question = get_closest_match(normalized_query, qa_dict.keys())
    if closest_question:
        answer = qa_dict[closest_question]
    else:
        if "service" in normalized_query:
            answer = "WhitespacesAI provides the following services:<br><ol>" + "".join([f"<li>{service}</li>" for service in services_data]) + "</ol>" + \
                     f"\n\nFor more information on our services, visit: {create_hyperlink('WhitespacesAI Services', 'https://whitespaces.ai/products/')}"
        elif "product" in normalized_query:
            answer = qa_dict.get("What are the products that they offer?", "") + \
                     f"\n\nFor more details, visit: {create_hyperlink('WhitespacesAI Products', 'https://whitespaces.ai/products/')}"
        elif "whitespacesai" in normalized_query:
            answer = qa_dict.get("what is whitespacesai?", "") + \
                     f"\n\nIf you want to learn more, visit: {create_hyperlink('WhitespacesAI', 'https://whitespaces.ai/')}"
        elif "hey" or "hi" or "Hello" in normalized_query:
            answer= "Hey! How can i assist you today"
        else:
            answer = "I'm sorry, I couldn't find an answer to that. Could you please rephrase?"

    follow_up_suggestions = suggest_follow_up(user_query)
    return jsonify({
        "answer": answer,
        "suggestions": follow_up_suggestions
    })

if __name__ == '__main__':
    app.run(debug=True)