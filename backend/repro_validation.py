from src.brain import validate_file
import io

class MockFile:
    def __init__(self, filename, content):
        self.filename = filename
        self.content = content
        self.pointer = 0
    
    def seek(self, pos):
        self.pointer = pos
        
    def read(self, size=-1):
        if size == -1:
            data = self.content[self.pointer:]
            self.pointer = len(self.content)
            return data
        else:
            data = self.content[self.pointer:self.pointer+size]
            self.pointer += size
            return data

# Load titanic.json
try:
    with open('d:/subject project/titanic.json', 'rb') as f:
        json_content = f.read()
    
    # Mock invalid CSV reading of JSON (sanity check logic)
    print("Testing titanic.json validation...")
    mock_file = MockFile('titanic.json', json_content)
    
    # Needs to implement enough file-like interface for pandas
    # Actually simpler to just use open file
    with open('d:/subject project/titanic.json', 'rb') as real_file:
         # Need to attach filename attribute
         class FileWrapper:
             def __init__(self, f, name):
                 self.f = f
                 self.filename = name
             def __getattr__(self, attr):
                 return getattr(self.f, attr)
         
         wrapped = FileWrapper(real_file, 'titanic.json')
         is_valid, msg = validate_file(wrapped)
         print(f"Result: {is_valid}, Message: {msg}")

except Exception as e:
    print(f"Test Failed: {e}")
