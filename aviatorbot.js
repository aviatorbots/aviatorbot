let isRunning = false;
let simulationInterval;
let currentBalance = 0;
let startingBalance = 0;

function getRandomMultiplier() {
  const r = Math.random();
  return Math.max(1.01, parseFloat((1 + (-Math.log(r))).toFixed(2)));
}

const socket = new WebSocket('wss://game-server.aviator.com');
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Current multiplier:', data.multiplier);
};

function updateBalanceDisplay() {
  document.getElementById("current-balance").textContent = currentBalance.toFixed(2);
}

function startSimulation() {
  if (isRunning) return;
  isRunning = true;
  
  // Set starting balance equal to stake amount
  const stake = parseFloat(document.getElementById("stake").value);
  startingBalance = stake;
  currentBalance = startingBalance;
  document.getElementById("starting-balance").textContent = startingBalance.toFixed(2);
  document.getElementById("final-balance").textContent = "-";
  updateBalanceDisplay();
  
  const target = parseFloat(document.getElementById("target").value);
  const rounds = parseInt(document.getElementById("rounds").value);
  const logDiv = document.getElementById("log");
  
  logDiv.innerHTML = "";
  let currentRound = 0;

  simulationInterval = setInterval(() => {
    if (currentRound >= rounds || !isRunning || currentBalance <= 0) {
      stopSimulation();
      return;
    }

    const multiplier = getRandomMultiplier();
    let resultText, profit;

    if (multiplier >= target) {
      profit = stake * target - stake;
      currentBalance += profit;
      resultText = `<span class="win">🟢 Round ${currentRound + 1}: Cashed out at ${multiplier}x | +${profit.toFixed(2)}</span>`;
    } else {
      profit = -stake;
      currentBalance -= stake;
      resultText = `<span class="loss">🔴 Round ${currentRound + 1}: Crashed at ${multiplier}x | -${stake.toFixed(2)}</span>`;
    }

    logDiv.innerHTML += `${resultText}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
    updateBalanceDisplay();
    currentRound++;

    if (currentRound === rounds || currentBalance <= 0) {
      document.getElementById("final-balance").textContent = currentBalance.toFixed(2);
      logDiv.innerHTML += `<br><strong>Final Balance: ${currentBalance.toFixed(2)}</strong>`;
      if (currentBalance <= 0) {
        logDiv.innerHTML += `<br><span class="loss">❌ Ran out of balance!</span>`;
      }
    }
  }, 500);
}

function stopSimulation() {
  if (isRunning) {
    document.getElementById("final-balance").textContent = currentBalance.toFixed(2);
  }
  isRunning = false;
  clearInterval(simulationInterval);
}



// Initialize balance display when stake changes
document.getElementById("stake").addEventListener("input", function() {
  startingBalance = parseFloat(this.value) || 0;
  currentBalance = startingBalance;
  document.getElementById("starting-balance").textContent = startingBalance.toFixed(2);
  document.getElementById("current-balance").textContent = startingBalance.toFixed(2);
});
