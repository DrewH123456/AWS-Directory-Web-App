import json
import boto3
import re
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

s3          = boto3.client('s3')
bucket_name = 'higginbothamprog4'

table_name = 'UserData'
table      = boto3.resource('dynamodb').Table(table_name)

def lambda_handler(event, context):
    status = None
    body   = None
    try:
        event = json.loads(event.get('body'))
        print("Parsed Event Body:", event)
    except json.JSONDecodeError:
        pass
    
    button = event.get('button')
    if button == 'query':
        status, body = query(event, status, body)
    else:
        key = event.get('key')
        if key:
            if button == 'loadData':
                status, body = load_data(event, key, status, body)
            elif button == 'clearData':
                status, body = clear_data(key, status, body)
            else:
                status = 400
                body   = 'Request to Lambda Failed: Could not find which of this website\'s buttons was pressed'

            if not body:
                status = 200
                body   = f'{button} Request Succeeded!'
        else:
            status = 400
            body   = 'Request to Lambda Failed: Could not find S3 Object key'

    return {
        'status': status,
        'body':   body
    }

def load_data(event, key, status, body):
    object = event.get('object')
    if object:
        try:
            s3.put_object(Bucket=bucket_name, Key=key, Body=json.dumps(object))
        except ClientError as err:
            status = err.response['Error']['Code']
            body   = f'Request to S3 Bucket Failed: {err}'
        else:
            items = []
            lines = object.split('\n')
            for line in lines:
                match = re.match(r'(?P<lastName>\S+)\s+(?P<firstName>\S+)(?P<attributes>.*)', line)
                if match:
                    item = match.groupdict()
                    attributes = []
                    for attribute in item.get('attributes', '').split():
                        attributes.append(attribute.split('='))
                    del item['attributes']
                    item.update(attributes)
                    items.append(item)
            if items:
                try:
                    for item in items:
                        table.put_item(Item=item)
                except ClientError as err2:
                    status = err2.response['Error']['Code']
                    body       = f'Request to DynamoDB Failed: {err2}'
            else:
                status = 400
                body   = 'Load Data Request to Lambda Failed: Could not find items to load into DynamoDB'
    else:
        status = 400
        body   = 'Load Data Request to Lambda Failed: Could not find object to load into S3 Bucket'
    return status, body

def clear_data(key, status, body):
    try:
        s3.delete_object(Bucket=bucket_name, Key=key)
    except ClientError as err:
        status = err.response['Error']['Code']
        body   = f'Clear Data Request to S3 Object Failed: {err}'
    else:
        try:
            for item in table.scan().get('Items', []):
                table.delete_item(Key={'lastName': item['lastName'], 'firstName': item['firstName']})
        except ClientError as err2:
            status = err2.response['Error']['Code']
            body   = f'Clear Data Request to DynamoDB Failed: {err2}'
    return status, body

def query(event, status, body):
    lastName  = event.get('lastName')
    firstName = event.get('firstName')
    results    = None
    try:
        if lastName and firstName:
            results = table.query(IndexName='lastName-index', KeyConditionExpression=Key('lastName').eq(lastName), FilterExpression=Key('firstName').eq(firstName)).get('Items', [])
        elif lastName:
            results = table.query(IndexName='lastName-index', KeyConditionExpression=Key('lastName').eq(lastName)).get('Items', [])
        elif firstName:
            results = table.query(IndexName='firstName-index', KeyConditionExpression=Key('firstName').eq(firstName)).get('Items', [])
        else:
            status = 400
            body   = 'Query Request to Lambda Failed: could not find 1+ name to query with'
    except ClientError as err:
        status = err.response['Error']['Code']
        body   = f'Query Request to DynamoDB Failed: {err}'
    else:
        status = 200
        body   = f'Query Request Succeeded!\n    Results:'
        if results:
            for result in results:
                body += f'\n      {result.get("lastName")}, {result.get("firstName")} '
                del result['lastName'], result['firstName']
                body += str(result)
        else:
            body += '\n      (none)'
    return status, body