import json
import boto3

def lambda_handler(event, context):
    try:
        # Get the query from the request body - handle both direct and API Gateway events
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
            
        query = body.get('query', '')
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': 'Query parameter is required'
            }
        
        # Initialize Bedrock client (uses IAM role automatically)
        bedrock_client = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        # Call Bedrock retrieveAndGenerate
        response = bedrock_client.retrieve_and_generate(
            input={'text': query},
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': 'OQEBEL880T',
                    'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
                }
            }
        )
        
        # Extract the generated text from the response
        generated_text = response.get('output', {}).get('text', 'No response generated')
        
        # Make the response shorter and more concise
        # Remove excessive formatting and make it more conversational
        if len(generated_text) > 200:
            # Split by sentences and take the first 2-3 most relevant sentences
            sentences = generated_text.split('. ')
            # Take first 2-3 sentences that contain the most relevant info
            short_response = '. '.join(sentences[:2]) + '.'
            
            # If still too long, truncate at word boundary
            if len(short_response) > 150:
                words = short_response.split()
                short_response = ' '.join(words[:20]) + '...'
        else:
            short_response = generated_text
        
        # Return in VAPI-expected format - just the text, not JSON wrapped
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': short_response
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': f'Error: {str(e)}'
        }
