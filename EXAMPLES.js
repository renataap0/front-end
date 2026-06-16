// EXEMPLOS PRÁTICOS DE USO - Racing Angels Frontend

// ============================================================
// 1. LOGIN COM CREDENCIAIS PADRÃO
// ============================================================

// No seu script.js ou no console do navegador:

// Admin
window.loginApi('admin', '123456')
  .then(data => {
    console.log('✅ Login admin:', data);
    // Agora pode usar endpoints protegidos
    return window.getRacesApi();
  })
  .then(races => console.log('🏁 Corridas:', races))
  .catch(err => console.error('❌ Erro:', err));

// Equipe
window.loginApi('equipe', '123456')
  .then(data => console.log('✅ Equipe logged in:', data))
  .catch(err => console.error('❌ Login failed:', err));

// Piloto/Driver
window.loginApi('corredor', '123456')
  .then(data => console.log('✅ Driver logged in:', data))
  .catch(err => console.error('❌ Login failed:', err));


// ============================================================
// 2. LISTAR DADOS
// ============================================================

// Listar corridas
window.getRacesApi()
  .then(races => {
    console.log('Todas as corridas:', races);
    races.forEach(race => {
      console.log(`${race.name} - ${race.driver} (${race.status})`);
    });
  })
  .catch(err => console.error('Erro ao buscar races:', err));

// Listar com filtro
window.getRacesApi({ teamId: 1 })
  .then(races => console.log('Corridas do time 1:', races))
  .catch(err => console.error('Erro:', err));


// ============================================================
// 3. CRIAR PEDIDO NA LOJA
// ============================================================

const orderData = {
  customerName: 'João Silva',
  customerEmail: 'joao@example.com',
  customerZip: '01310-100',
  paymentMethod: 'credit_card',
  items: [
    { productId: 1, quantity: 2, unitPrice: 100.00 },
    { productId: 2, quantity: 1, unitPrice: 50.00 }
  ]
};

window.createOrderApi(orderData)
  .then(order => {
    console.log('✅ Pedido criado:', order);
    console.log(`Código: ${order.code}`);
    console.log(`Total: R$ ${order.total}`);
  })
  .catch(err => console.error('❌ Erro ao criar pedido:', err));


// ============================================================
// 4. ENDPOINT CUSTOMIZADO
// ============================================================

// Qualquer GET
window.apiFetch('/teams')
  .then(teams => console.log('Equipes:', teams))
  .catch(err => console.error('Erro:', err));

// Qualquer POST
window.apiFetch('/drivers', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Novo Piloto',
    nationality: 'Brasil',
    teamId: 1
  })
})
  .then(driver => console.log('✅ Piloto criado:', driver))
  .catch(err => console.error('❌ Erro:', err));

// PUT/UPDATE
window.apiFetch('/drivers/1', {
  method: 'PUT',
  body: JSON.stringify({
    name: 'Lia Torres Atualizada',
    status: 'Titular'
  })
})
  .then(updated => console.log('✅ Atualizado:', updated))
  .catch(err => console.error('❌ Erro:', err));

// DELETE
window.apiFetch('/races/1', { method: 'DELETE' })
  .then(() => console.log('✅ Deletado'))
  .catch(err => console.error('❌ Erro:', err));


// ============================================================
// 5. VERIFICAR TOKEN E USUÁRIO
// ============================================================

// Verificar se está logged in
const token = window.getToken();
if (token) {
  console.log('✅ Token válido:', token);
  
  // Pegar dados do usuário
  const user = JSON.parse(localStorage.getItem('racingAngelsUser'));
  console.log('Usuário:', user);
  console.log('Role:', user.role);
} else {
  console.log('❌ Não há token - faça login');
}

// Fazer logout (limpar localStorage)
function logout() {
  localStorage.removeItem('racingAngelsToken');
  localStorage.removeItem('racingAngelsUser');
  console.log('✅ Logout realizado');
  window.location.href = 'login.html';
}


// ============================================================
// 6. INTEGRAR EM FORMULÁRIO (exemplo)
// ============================================================

// No login.html, no evento de submit do form:
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const result = await window.loginApi(username, password);
    console.log('✅ Login sucesso:', result);
    
    // Redirecionar para dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('❌ Login failed:', error);
    alert('Usuário ou senha inválidos');
  }
});


// ============================================================
// 7. ESTRUTURA DA RESPONSE (RACE EXAMPLE)
// ============================================================

/*
{
  "id": 1,
  "name": "Interlagos GP",
  "status": "Finalizada",
  "laps": 42,
  "bestLapMs": 81348,      // milisegundos
  "lastLapMs": 82005,
  "raceDate": "2026-06-16T14:00:00Z",
  "teamId": 1,
  "driverId": 1,
  "trackId": 1,
  "carId": 1,
  "createdAt": "2026-06-16T10:00:00Z",
  "updatedAt": "2026-06-16T14:30:00Z"
}
*/

// Converter milisegundos para MM:SS.mmm
function formatLapTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

window.getRacesApi()
  .then(races => {
    races.forEach(race => {
      console.log(`${race.name}:`);
      console.log(`  Melhor volta: ${formatLapTime(race.bestLapMs)}`);
      console.log(`  Última volta: ${formatLapTime(race.lastLapMs)}`);
    });
  });


// ============================================================
// 8. ERROR HANDLING
// ============================================================

async function safeApiCall(endpoint) {
  try {
    const data = await window.apiFetch(endpoint);
    return { success: true, data };
  } catch (error) {
    console.error(`Erro em ${endpoint}:`, error.message);
    
    if (error.message.includes('401')) {
      console.log('Token expirado - faça login novamente');
      window.location.href = 'login.html';
    }
    
    return { success: false, error: error.message };
  }
}

// Uso:
const result = await safeApiCall('/races');
if (result.success) {
  console.log('Dados:', result.data);
} else {
  console.error('Falha:', result.error);
}


// ============================================================
// 9. CACHE LOCAL (opcional)
// ============================================================

async function getRacesWithCache(forceRefresh = false) {
  const cacheKey = 'racingAngelsRaces_cache';
  const cacheTime = 5 * 60 * 1000; // 5 minutos
  
  const cached = localStorage.getItem(cacheKey);
  const timestamp = localStorage.getItem(cacheKey + '_time');
  
  if (!forceRefresh && cached && timestamp && Date.now() - timestamp < cacheTime) {
    console.log('📦 Usando cache');
    return JSON.parse(cached);
  }
  
  console.log('🔄 Buscando dados frescos');
  const races = await window.getRacesApi();
  
  localStorage.setItem(cacheKey, JSON.stringify(races));
  localStorage.setItem(cacheKey + '_time', Date.now());
  
  return races;
}

// Uso:
const races = await getRacesWithCache();
// Próxima chamada dentro de 5 min usará cache
// getRacesWithCache(true) força refresh


// ============================================================
// 10. MONITORAMENTO SIMPLES
// ============================================================

// Verificar status da API a cada 10 segundos
setInterval(async () => {
  try {
    const status = await window.apiFetch('/users/me');
    console.log('✅ API ok:', status.username);
    document.getElementById('apiStatus')?.textContent = '🟢 Online';
  } catch (error) {
    console.error('❌ API indisponível:', error.message);
    document.getElementById('apiStatus')?.textContent = '🔴 Offline';
  }
}, 10000);

