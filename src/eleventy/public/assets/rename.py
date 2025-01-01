# Rename all .jpg file names in a directory from current to 1.jpg, 2.jpg, 3.jpg, etc.


import os

def random_string(length):
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
  
def rename_jpg_files(directory):
    try:
        # Get a list of all .jpg files in the directory
        # jpg_files = [file for file in os.listdir(directory) if file.lower().endswith('.jpg')]
        
        # # Sort the files to ensure consistent ordering
        # jpg_files.sort()
        
        # Rename files with random string
        for file in os.listdir(directory):
            new_name = f"{random_string(4)}.jpg"
            old_path = os.path.join(directory, file)
            new_path = os.path.join(directory, new_name)
            os.rename(old_path, new_path)

        print("All files have been successfully renamed to random strings.")
  
        print("Renaming files to sequential numbering...")
        # Rename files with sequential numbering
        for index, file in enumerate(os.listdir(directory)):
                new_name = f"{index + 1}.jpg"
                old_path = os.path.join(directory, file)
                new_path = os.path.join(directory, new_name)
                os.rename(old_path, new_path)
    except Exception as e:
        print(f"An error occurred: {e}")

# Specify the directory containing the .jpg files
directory = './images/'
rename_jpg_files(directory)

