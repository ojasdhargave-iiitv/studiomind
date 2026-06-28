import os
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

def test():
    glm_key = os.getenv("GLM_API_KEY")
    client = OpenAI(
        api_key=glm_key,
        base_url="https://open.bigmodel.cn/api/paas/v4/"
    )
    print("Sending test request to Zhipu using glm-4.5-air...")
    response = client.chat.completions.create(
        model="glm-4.5-air",
        messages=[{"role": "user", "content": "Hello, write a 3-word response."}]
    )
    print("Response:", response.choices[0].message.content)

if __name__ == "__main__":
    test()
