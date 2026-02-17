import hashlib

class LogInModel:
    def __init__(self, id, first_name, last_name, email, password_hash, sal):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password_hash = password_hash
        self.salt = salt

    def verify_password(self, password):
        
        hashed = haslib.sha256((password + self.salt).encode("utf-8")).hexdigest()

        return hashed == self.password_hash
    
