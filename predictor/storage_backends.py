from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class PrivateMediaStorage(S3Boto3Storage):
    """
    S3 storage for private media files (uploads and analysis plots).
    Generates presigned URLs for access.
    """
    location = ''
    default_acl = None
    file_overwrite = False
    querystring_auth = True
    querystring_expire = 3600  
PublicMediaStorage = PrivateMediaStorage
