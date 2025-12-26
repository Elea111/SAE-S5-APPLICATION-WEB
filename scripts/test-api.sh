#!/bin/bash

# Start server in background
node src/server/index.js &
SERVER_PID=$!

sleep 2

BASE_URL="http://localhost:4000"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="SecurePass123"

echo "🧪 Testing Outillio API...\n"

# Register
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"isPro\": false
  }")

echo "Response: $REGISTER_RESPONSE\n"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE\n"

# Get User
echo "3️⃣  Testing Get User (with token)..."
curl -s -X GET "$BASE_URL/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Publish Equipment
echo "\n4️⃣  Testing Publish Equipment..."
EQUIPMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/equipments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Perceuse électrique 18V\",
    \"description\": \"Perceuse professionnelle avec batterie et chargeur inclus. État neuf.\",
    \"daily_price\": 25.99,
    \"caution_deposit\": 50,
    \"location\": \"Paris, France\",
    \"condition\": \"neuf\"
  }")

echo "Response: $EQUIPMENT_RESPONSE\n"
EQUIPMENT_ID=$(echo $EQUIPMENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Search Equipment
echo "5️⃣  Testing Search Equipment..."
curl -s -X GET "$BASE_URL/api/equipments?title=Perceuse&limit=10" | jq .

# Test Validation Error
echo "\n6️⃣  Testing Validation Error (invalid email)..."
curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Jane\",
    \"lastName\": \"Smith\",
    \"email\": \"invalid-email\",
    \"password\": \"SecurePass123\"
  }" | jq .

echo "\n✅ Tests completed!\n"

# Kill server
kill $SERVER_PID
