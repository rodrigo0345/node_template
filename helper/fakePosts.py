import mysql.connector
from faker import Faker
import random
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Connect to the database
db = mysql.connector.connect(
  host=os.getenv("M_DATABASE_HOST"),
  user=os.getenv("M_DATABASE_USER"),
  password=os.getenv("M_DATABASE_PASSWORD"),
  database=os.getenv("M_DATABASE_NAME")
)

cursor = db.cursor()

fake = Faker()

# Generate and insert 100,000 users
for i in range(100000):
    title = fake.sentence()
    content = fake.paragraph()
    author = fake.name()
    
    try: 
        query = "INSERT INTO posts (title, content, author) VALUES (%s, %s, %s)"
        values = (title, content, author)
        
        cursor.execute(query, values)
        db.commit()
    except:
        print("Error inserting user - " + str(i))

    

cursor.close()
db.close()