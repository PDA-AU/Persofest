import requests
import sys
from datetime import datetime

class PersofestAPITester:
    def __init__(self, base_url="https://persofest-register.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.existing_user_data = {
            "register_number": "2026AIML001",
            "password": "test123"
        }
        self.test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "register_number": f"2026TEST{datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "phone_number": "9876543210",
            "department": "Artificial Intelligence and Data Science",
            "year_of_study": "First Year",
            "password": "TestPass123!"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"   Response: {response_data}")
                        return True, response_data
                    except:
                        return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_get_departments(self):
        """Test departments endpoint"""
        success, response = self.run_test("Get Departments", "GET", "api/departments", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} departments")
            return True
        return False

    def test_get_years(self):
        """Test years endpoint"""
        success, response = self.run_test("Get Years", "GET", "api/years", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} years")
            return True
        return False

    def test_register_user(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=self.test_user_data
        )
        if success and 'id' in response:
            print(f"   User registered with ID: {response['id']}")
            return True
        return False

    def test_login_existing_user(self):
        """Test login with existing user"""
        success, response = self.run_test(
            "Login Existing User (2026AIML001)",
            "POST",
            "api/auth/login",
            200,
            data=self.existing_user_data
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login successful, token received")
            return True
        return False

    def test_login_user(self):
        """Test user login and get token"""
        login_data = {
            "register_number": self.test_user_data["register_number"],
            "password": self.test_user_data["password"]
        }
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login successful, token received")
            return True
        return False

    def test_get_profile(self):
        """Test get user profile"""
        if not self.token:
            print("❌ No token available for profile test")
            return False
        
        success, response = self.run_test(
            "Get Profile",
            "GET",
            "api/profile/me",
            200
        )
        if success and 'name' in response:
            print(f"   Profile retrieved for: {response['name']}")
            return True
        return False

    def test_update_profile(self):
        """Test update user profile"""
        if not self.token:
            print("❌ No token available for profile update test")
            return False
        
        update_data = {
            "email": f"updated{datetime.now().strftime('%H%M%S')}@example.com",
            "phone_number": "9876543211"
        }
        success, response = self.run_test(
            "Update Profile",
            "PATCH",
            "api/profile/me",
            200,
            data=update_data
        )
        if success and response.get('email') == update_data['email']:
            print(f"   Profile updated successfully")
            return True
        return False

def main():
    print("🚀 Starting PERSOFEST'26 API Tests")
    print("=" * 50)
    
    tester = PersofestAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Get Departments", tester.test_get_departments),
        ("Get Years", tester.test_get_years),
        ("Login Existing User", tester.test_login_existing_user),
        ("Get Profile", tester.test_get_profile),
        ("Update Profile", tester.test_update_profile),
        ("User Registration", tester.test_register_user),
        ("New User Login", tester.test_login_user),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())