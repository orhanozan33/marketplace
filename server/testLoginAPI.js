import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('🔍 Login API testi...\n');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'orhanozan33@gmail.com',
        password: '33333333'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login başarılı!');
      console.log('Token:', data.token ? 'Var' : 'Yok');
      console.log('User:', data.user?.email);
    } else {
      console.log('\n❌ Login başarısız!');
      console.log('Hata:', data.error);
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
};

testLogin();


