import json
import re
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

bucket_name = 'higginbothamprog4'
table_name = 'UserData'

s3 = boto3.client('s3')
table = boto3.resource('dynamodb').Table(table_name)

def lambda_handler(event, context):
    status = None
    body = None
    try:
        event_body = json.loads(event.get('body'))
        print("Event body:", event_body)
    except json.JSONDecodeError:
        pass
    button = event_body.get('button')
    
    if button == 'queryData':
        status, body = query(event_body)
    else:
        key = event_body.get('key')
        if key:
            if button == 'clearData':
                status, body = clear_data(key)
            elif button == 'loadData':
                status, body = load_data(event_body, key)
            else:
                status = 400
                body = 'Request to Lambda failed because the button action from the website was not recognized.'

        else:
            status = 400
            body = 'Request to Lambda failed because S3 object key could not be found.'

    return {
        'status': status,
        'body': body
    }

def load_data(event, key):
    object_data = event.get('object')
    if not object_data:
        return 400, 'Request to load data into the S3 bucket failed because the object could not be found'

    try:
        s3.put_object(Bucket=bucket_name, Key=key, Body=json.dumps(object_data))
    except ClientError as e:
        return e.response['Error']['Code'], f'Request to S3 failed: {e}'

    items = []
    lines = object_data.split('\n')
    for line in lines:
        match = re.match(r'(?P<lastName>\S+)\s+(?P<firstName>\S+)(?P<attributes>.*)', line)
        if match:
            item = match.groupdict()
            attributes = {k: v for k, v in (attribute.split('=') for attribute in item.get('attributes', '').split())}
            del item['attributes']
            item.update(attributes)
            items.append(item)

    if not items:
        return 400, 'Request to load data into DynamoDB failed, no items were found'

    try:
        with table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
    except ClientError as e:
        return e.response['Error']['Code'], f'Request to load data into DynamoDB failed: {e}'

    return 200, 'Request to load data succeeded'

def clear_data(key):
    try:
        s3.delete_object(Bucket=bucket_name, Key=key)
    except ClientError as e:
        return e.response['Error']['Code'], f'Request to clear data from S3 failed: {e}'
    
    # Scan DynamoDB table and delete items in batches
    try:
        response = table.scan()
        with table.batch_writer() as batch:
            for item in response.get('Items', []):
                batch.delete_item(Key={'lastName': item['lastName'], 'firstName': item['firstName']})
    except ClientError as e:
        return e.response['Error']['Code'], f'Request to clear data from DynamoDB failed: {e}'

    return 200, 'Request to clear data succeeded'

def query(event):
    firstName = event.get('firstName')
    lastName = event.get('lastName')

    if not (firstName or lastName):
        return 400, 'Request to query failed, no names provided'

    index_name = 'firstName-index' if firstName else 'lastName-index'
    key_condition_expression = Key('firstName').eq(firstName) if firstName else Key('lastName').eq(lastName)

    try:
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression=key_condition_expression
        )
        items = response.get('Items', [])
    except ClientError as e:
        return e.response['Error']['Code'], f'Failed query: {e}'

    # If both first and last name are provided, filter the results based on the last name
    if firstName and lastName:
        items = [item for item in items if item.get('lastName') == lastName]

    if items:
        formatted_results = '\n'.join([f'      {result.get("lastName")}, {result.get("firstName")} {str(result)}' for result in items])
        formatted_results = formatted_results.replace('\n', '').replace('  ', ' ').strip()  
        return 200, f'Request to query data from DynamoDB succeeded. Results: {formatted_results.strip()}' 
    else:
        return 200, 'Request to query data from DynamoDB succeeded, but no results were found for the specified parameters.'
