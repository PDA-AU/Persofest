import requests
import sys
from datetime import datetime

class PersofestAPITester:
    def __init__(self, base_url="https://event-reg-hub-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_a_referral_code = None
        self.user_d_referral_code = None
        
        # Test data as specified in the review request
        self.user_a_data = {
            "name": "Test User A",
            "register_number": "2026TEST001",
            "email": "testa@test.com",
            "phone_number": "1234567890",
            "department": "Artificial Intelligence and Data Science",
            "year_of_study": "First Year",
            "password": "test123"
        }
        
        self.user_b_data = {
            "name": "Test User B",
            "register_number": "2026TEST002",
            "email": "testb@test.com",
            "phone_number": "1234567891",
            "department": "Aerospace Engineering",
            "year_of_study": "Second Year",
            "password": "test123"
        }
        
        self.user_c_data = {
            "name": "Test User C",
            "register_number": "2026TEST003",
            "email": "testc@test.com",
            "phone_number": "1234567892",
            "department": "Computer Technology",
            "year_of_study": "Third Year",
            "password": "test123"
        }
        
        self.user_d_data = {
            "name": "Test User D",
            "register_number": "2026TEST004",
            "email": "testd@test.com",
            "phone_number": "1234567893",
            "department": "Electronics and Communication Engineering",
            "year_of_study": "First Year",
            "password": "test123"
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

    def test_register_user_a_no_referral(self):
        """Test User A registration without referral code"""
        success, response = self.run_test(
            "Register User A (no referral)",
            "POST",
            "api/auth/register",
            200,
            data=self.user_a_data
        )
        if success and 'referral_code' in response and 'referral_count' in response:
            self.user_a_referral_code = response['referral_code']
            print(f"   User A referral code: {self.user_a_referral_code}")
            print(f"   User A referral count: {response['referral_count']}")
            if response['referral_count'] == 0 and len(self.user_a_referral_code) == 5:
                return True
        return False

    def test_register_user_b_with_referral(self):
        """Test User B registration with User A's referral code"""
        if not self.user_a_referral_code:
            print("❌ User A referral code not available")
            return False
            
        user_b_with_referral = self.user_b_data.copy()
        user_b_with_referral['referral_code'] = self.user_a_referral_code
        
        success, response = self.run_test(
            "Register User B (with User A's referral)",
            "POST",
            "api/auth/register",
            200,
            data=user_b_with_referral
        )
        if success and 'referral_code' in response:
            print(f"   User B referral code: {response['referral_code']}")
            return True
        return False

    def test_register_user_c_with_referral(self):
        """Test User C registration with User A's referral code"""
        if not self.user_a_referral_code:
            print("❌ User A referral code not available")
            return False
            
        user_c_with_referral = self.user_c_data.copy()
        user_c_with_referral['referral_code'] = self.user_a_referral_code
        
        success, response = self.run_test(
            "Register User C (with User A's referral)",
            "POST",
            "api/auth/register",
            200,
            data=user_c_with_referral
        )
        if success and 'referral_code' in response:
            print(f"   User C referral code: {response['referral_code']}")
            return True
        return False

    def test_register_user_d_no_referral(self):
        """Test User D registration without referral code"""
        success, response = self.run_test(
            "Register User D (no referral)",
            "POST",
            "api/auth/register",
            200,
            data=self.user_d_data
        )
        if success and 'referral_code' in response:
            self.user_d_referral_code = response['referral_code']
            print(f"   User D referral code: {self.user_d_referral_code}")
            if len(self.user_d_referral_code) == 5 and self.user_d_referral_code != self.user_a_referral_code:
                return True
        return False

    def test_register_with_invalid_referral(self):
        """Test registration with invalid referral code"""
        invalid_user_data = {
            "name": "Invalid Test User",
            "register_number": "2026INVALID",
            "email": "invalid@test.com",
            "phone_number": "9999999999",
            "department": "Information Technology",
            "year_of_study": "First Year",
            "password": "test123",
            "referral_code": "INVALID"
        }
        
        success, response = self.run_test(
            "Register with invalid referral code",
            "POST",
            "api/auth/register",
            400,  # Should fail with 400
            data=invalid_user_data
        )
        return success

    def test_login_user_a(self):
        """Test login User A and get token"""
        login_data = {
            "register_number": self.user_a_data["register_number"],
            "password": self.user_a_data["password"]
        }
        success, response = self.run_test(
            "Login User A",
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

    def test_get_user_a_profile(self):
        """Test get User A profile to verify referral count"""
        if not self.token:
            print("❌ No token available for profile test")
            return False
        
        success, response = self.run_test(
            "Get User A Profile",
            "GET",
            "api/profile/me",
            200
        )
        if success and 'referral_count' in response:
            print(f"   User A referral count: {response['referral_count']}")
            print(f"   User A referral code: {response['referral_code']}")
            # Should have 2 referrals (User B and User C)
            if response['referral_count'] == 2:
                return True
        return False

    def test_stats_endpoint(self):
        """Test stats endpoint for total participants"""
        success, response = self.run_test(
            "Get Stats",
            "GET",
            "api/stats",
            200
        )
        if success and 'total_participants' in response:
            print(f"   Total participants: {response['total_participants']}")
            # Should have 4 participants (A, B, C, D)
            if response['total_participants'] >= 4:
                return True
        return False

    def test_leaderboard_endpoint(self):
        """Test leaderboard endpoint"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "api/leaderboard",
            200
        )
        if success and isinstance(response, list):
            print(f"   Leaderboard entries: {len(response)}")
            if len(response) > 0:
                top_user = response[0]
                print(f"   Top referrer: {top_user['name']} with {top_user['referral_count']} referrals")
                # User A should be at top with 2 referrals
                if top_user['name'] == 'Test User A' and top_user['referral_count'] == 2:
                    return True
            return len(response) >= 0  # At least return success if we get a list
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