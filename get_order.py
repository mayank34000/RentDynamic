import requests
from requests.auth import HTTPBasicAuth

# Your specific Test API Keys
KEY_ID = "rzp_test_TPWlCTZ9mczHSa"
KEY_SECRET = "o3TLYXIrYYVStzBpeDq8DjdD" 

url = "https://api.razorpay.com/v1/orders"

# Order details (30000 paise = ₹300)
payload = {
    "amount": 30000,
    "currency": "INR",
    "receipt": "demo_receipt_01"
}

# Make the request to Razorpay's servers
response = requests.post(url, json=payload, auth=HTTPBasicAuth(KEY_ID, KEY_SECRET))

print("Here is your Razorpay Response:")
print(response.json())