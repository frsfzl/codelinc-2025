import json

def lambda_handler(event, context):
    try:
        # Get the query from the request body
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
            
        query = body.get('query', '')
        
        # Simple test response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            },
            'body': f'Test response for query: {query}'
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            },
            'body': f'Error: {str(e)}'
        }
