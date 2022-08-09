//these are null objects that are overwritten by other stuff, clean by deleting this and creating them in-place
let idInfo = {
  pName: null,
  region: null,
  accId: null,
  sumId: null,
  iconId: null,
};
let images = {
  pIcon: null,
  cIcon1: null,
  cIcon2: null,
  cIcon3: null,
  cGIcon1: null,
  cGIcon2: null,
  cGIcon3: null,
  cBackground: null,
  cBanner: null,
};
//initializing an empty arrays to store important stuff later
let gameId = [];
let partId = [];
let gameData = [];
let gameResult = [];
let champData = [];
let playerData = [];
let champName = [];
function setChampionName(data, i) {
  champName.push(data.name);
  paragraphChanger(i);
}
function setPlayerInfo(data) {
  //this sets the accId
  idInfo.accId = data.accountId;
  idInfo.sumId = data.id;
  idInfo.iconId = data.profileIconId;
}
function setMatchId(data) {
  //this sets all the game ids
  gameId.length = 0; // this clears the array every time when you submit, prefents game stacking
  for (let i = 0; i <= 9; i++) {
    gameId.push(data.matches[i].gameId);
  }
}
function setChampionData(data) {
  champData.length = 0;
  for (let i = 0; i <= 2; i++) {
    champData.push(data[i]);
  }
}

//get functions
async function getMatchId() {
  //this gets the match ids
  await fetch(
    `http://31.13.206.166:42069/lol/match/v4/matchlists/by-account/${idInfo.accId}?platform=${idInfo.region}&endIndex=10&beginIndex=0`
  )
    .then((res) => res.json())
    .then((data) => setMatchId(data));
}
async function getMatchData(id) {
  const response = await fetch(
    `http://31.13.206.166:42069/lol/match/v4/matches/${id}?platform=${idInfo.region}`
  );
  return response.json();
}
async function getPlayerData() {
  await fetch(
    `http://31.13.206.166:42069/lol/summoner/v4/summoners/by-name/${idInfo.pName}?platform=${idInfo.region}`
  )
    .then((res) => res.json())
    .then((data) => setPlayerInfo(data));
}
async function getChampionData() {
  await fetch(
    `http://31.13.206.166:42069/lol/champion-mastery/v4/champion-masteries/by-summoner/${idInfo.sumId}?platform=${idInfo.region}`
  )
    .then((res) => res.json())
    .then((data) => setChampionData(data));
}
async function getChampionName(owo, i) {
  fetch(`https://cdn.communitydragon.org/11.1.3/champion/${owo}/data`)
    .then((res) => res.json())
    .then((data) => setChampionName(data, i));
}
//get functions
//logix
function paragraphChanger(i) {
  document.getElementById("cName" + i).textContent = champName[i];
  document.getElementById("cPoints" + i).textContent =
    champData[i].championPoints;
}
function kdaMaker(i) {
  let kda =
    (playerData[i].stats.kills + playerData[i].stats.assists) /
    playerData[i].stats.deaths;
  return kda;
}
function winToNum(i) {
  let result = gameData[i].teams.find(
    (o) => o.teamId === playerData[i].teamId
  ).win;
  let num;
  if (result === "Win") {
    num = 1;
  } else {
    num = 0;
  }
  return num;
}
function winRate() {
  for (let i = 0; i <= 9; i++) {
    gameResult.push(winToNum(i));
  }

  let sum = gameResult.reduce(function (a, b) {
    return a + b;
  }, 0);
  let winRate = sum / 10;
  return winRate * 100 + "%";
}

//logix
async function submitInfo() {
  //this gets the player accId

  idInfo.pName = document.getElementById("nameInput").value;
  idInfo.region = document.getElementById("region").value;

  await getPlayerData();

  await getMatchId();

  getChampionData();

  gameResult.length = 0;
  gameData.length = 0;
  for (let i = 0; i <= 9; i++) {
    gameData.push(await getMatchData(gameId[i]));
  }

  partId.length = 0;
  for (let i = 0; i <= 9; i++) {
    partId.push(
      gameData[i].participantIdentities.find(
        (o) => o.player.summonerName === idInfo.pName
      ).participantId
    );
  }

  playerData.length = 0;
  for (let i = 0; i <= 9; i++) {
    playerData.push(
      gameData[i].participants.find((o) => o.participantId === partId[i])
    );
  }

  champName.length = 0;
  for (let i = 0; i <= 2; i++) {
    await getChampionName(champData[i].championId, i);
  }

  // await getExactChampionData(champData[0].championId)
  await toggleVisible();
}

//fromt emd
async function toggleVisible() {
  // clean up redundant code, make code into its own functions
  document.getElementById("pName").textContent = idInfo.pName;

  images.cIcon1 = `https://cdn.communitydragon.org/11.1.3/champion/${champData[0].championId}/square`;
  images.cIcon2 = `https://cdn.communitydragon.org/11.1.3/champion/${champData[1].championId}/square`;
  images.cIcon3 = `https://cdn.communitydragon.org/11.1.3/champion/${champData[2].championId}/square`;
  images.cGIcon1 = `https://cdn.communitydragon.org/11.1.3/champion/${playerData[0].championId}/square`;
  images.cGIcon2 = `https://cdn.communitydragon.org/11.1.3/champion/${playerData[1].championId}/square`;
  images.cGIcon3 = `https://cdn.communitydragon.org/11.1.3/champion/${playerData[2].championId}/square`;
  images.pIcon = `https://cdn.communitydragon.org/11.1.3/profile-icon/${idInfo.iconId}`;

  document.getElementById("pIcon").src = images.pIcon;
  document.getElementById("champ1").src = images.cIcon1;
  document.getElementById("champ2").src = images.cIcon2;
  document.getElementById("champ3").src = images.cIcon3;

  document.getElementById("cGIcon1").src = images.cGIcon1;
  document.getElementById("cGIcon2").src = images.cGIcon2;
  document.getElementById("cGIcon3").src = images.cGIcon3;
  document.getElementById("winrate").textContent = winRate();

  for (let i = 0; i <= 2; i++) {
    document.getElementById("kda" + i).textContent = kdaMaker(i).toFixed(2);
  }

  for (let i = 0; i <= 2; i++) {
    document.getElementById("kills" + i).textContent =
      "Kills: " + playerData[i].stats.kills;
    document.getElementById("deaths" + i).textContent =
      "Deaths: " + playerData[i].stats.deaths;
    document.getElementById("assists" + i).textContent =
      "Assists: " + playerData[i].stats.assists;
    document.getElementById("vision" + i).textContent =
      "Vision Score: " + playerData[i].stats.visionScore;
    document.getElementById("creeps" + i).textContent =
      "Creep Score: " + playerData[i].stats.totalMinionsKilled;
  }

  var dataPanel = document.getElementById("playerData");
  var visibilitySetting = dataPanel.style.visibility;
  dataPanel.style.visibility = "visible";
}
