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
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'Query parameter is required'})
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
        
        # Return in VAPI-expected format
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps(generated_text)  # Return just the text, not wrapped in an object
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps(f'Error: {str(e)}')
        }
