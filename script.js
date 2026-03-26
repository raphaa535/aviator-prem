// ---------- Nouvel algorithme Blizzard ----------
function hexToDecimal(hex){return parseInt(hex,16);}
function nombreEnMinutesSecondes(nombre){
    const str=nombre.toString();
    if(str.length<=2) return {minutes:0,seconds:nombre};
    const secondes=parseInt(str.slice(-2),10);
    const minutes=parseInt(str.slice(0,-2),10);
    return {minutes,seconds:secondes};
}
function heureEnSecondes(heure){
    const p=heure.split(":");
    return parseInt(p[0]||"0",10)*3600 + parseInt(p[1]||"0",10)*60 + parseInt(p[2]||"0",10);
}
function secondesEnHeure(s){
    const h=Math.floor(s/3600);
    const m=Math.floor((s%3600)/60);
    const sec=s%60;
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}
function ajusterJournee(s){
    const J=86400;
    let r=s;
    if(r>=J) r-=J;
    if(r<0) r+=J;
    return r;
}
function calculerPredictionBlizzard(h,s){
    const sp=(s||"000").substring(0,3);
    const v=hexToDecimal(sp||"0");
    const {minutes,seconds}=nombreEnMinutesSecondes(v);
    const o=minutes*60+seconds-140;
    const ds=heureEnSecondes(h||"00:00:00");
    const ts=ajusterJournee(ds+o);
    return {prediction:secondesEnHeure(ts)};
}

// ---------- Multiplicateurs originaux ----------
function iu(e,t){let n=Math.sin(e*9301+t*49297)*233280; return n-Math.floor(n);}
function aviatorMultiplicateurs(heure,minute,seconde,multi){
    const h = heure||0, m=minute||0, s=seconde||0, mult=multi||2;
    let seedBase = h*3600 + m*60 + s + Math.round(mult*100);
    let safeMultiplier = (2 + iu(seedBase+7,17)*2).toFixed(2);
    let midMultiplier  = (3 + iu(seedBase+67,23)*12).toFixed(2);
    let bigMultiplier  = (20 + iu(seedBase+83,31)*180).toFixed(2);
    return {safe: `x${safeMultiplier}`, mid: `x${midMultiplier}`, big: `x${bigMultiplier}`};
}

// ---------- Historique ----------
function saveHistory(res){
    let hist=JSON.parse(localStorage.getItem("aviatorHistory")||"[]");
    hist.unshift(res);
    if(hist.length>50) hist.pop();
    localStorage.setItem("aviatorHistory",JSON.stringify(hist));
    renderHistory();
}
function renderHistory(){
    let hist = JSON.parse(localStorage.getItem("aviatorHistory") || "[]");
    let container = document.getElementById("historyList");
    container.innerHTML = "";

    hist.forEach(item => {
        let div = document.createElement("div");
        div.className = "history-entry card"; 
        div.style.flexDirection = "column";
        div.innerHTML = `
            <div class="result-item">
                <span class="time final">${item.time1}</span>
                <span class="multi blizzard">😻</span>
            </div>
            ${item.time2 ? `<div class="result-item"><span class="time final">${item.time2}</span><span class="multi safe">${item.safe}</span></div>` : ''}
            ${item.time3 ? `<div class="result-item"><span class="time final">${item.time3}</span><span class="multi mid">${item.mid}</span></div>` : ''}
            ${item.time4 ? `<div class="result-item"><span class="time final">${item.time4}</span><span class="multi big">${item.big}</span></div>` : ''}
        `;
        container.appendChild(div);
    });
}

// ---------- Event listeners ----------
document.getElementById("toggleHistory").addEventListener("click",()=>{
    let card=document.getElementById("historyCard");
    card.style.display=(card.style.display==="none")?"block":"none";
});
document.getElementById("clearHistory").addEventListener("click",()=>{
    if(confirm("Voulez-vous vraiment effacer l'historique ?")){
        localStorage.removeItem("aviatorHistory");
        renderHistory();
    }
});
document.getElementById("predictBtn").addEventListener("click",function(){
    const timeVal=document.getElementById("time").value||"00:00:00";
    const seedVal=document.getElementById("seed").value||"000";
    const multiVal=document.getElementById("multi").value;
    const multi=parseFloat(multiVal);

    // ---------- Heure Blizzard ----------
    const predBlizzard = calculerPredictionBlizzard(timeVal, seedVal);
    document.getElementById("time1").textContent = predBlizzard.prediction;
    document.getElementById("blizzard1").textContent = "😻";

    // Masquer par défaut heures originales
    document.getElementById("orig2").style.display="none";
    document.getElementById("orig3").style.display="none";
    document.getElementById("orig4").style.display="none";

    let heure1, heure2, heure3, multObj;
    if(!isNaN(multi)){
        // ---------- Heures originales ----------
        const parts=timeVal.split(":");
        const h=parseInt(parts[0]||"0"), m=parseInt(parts[1]||"0"), s=parseInt(parts[2]||"0");
        let seedBase = h*3600 + m*60 + s + Math.round(multi*100);

        // Heure 2
        let delai1 = 120 + Math.floor(iu(seedBase+7,7)*(240-120));
        let secAleatoire1 = Math.floor(iu(seedBase+7,41)*60);
        let totalSec1 = h*3600 + m*60 + s + delai1;
        heure1 = `${Math.floor(totalSec1/3600)%24}:${Math.floor(totalSec1%3600/60)}:${secAleatoire1}`;

        // Heure 3
        let y = 50 + Math.floor(iu(seedBase+67,67)*70);
        let secAleatoire2 = Math.floor(iu(seedBase+67,73)*60);
        let totalSec2 = totalSec1 + y;
        heure2 = `${Math.floor(totalSec2/3600)%24}:${Math.floor(totalSec2%3600/60)}:${secAleatoire2}`;

        // Heure 4
        let T = 50 + Math.floor(iu(seedBase+83,83)*70);
        let secAleatoire3 = Math.floor(iu(seedBase+83,89)*60);
        let totalSec3 = totalSec2 + T;
        heure3 = `${Math.floor(totalSec3/3600)%24}:${Math.floor(totalSec3%3600/60)}:${secAleatoire3}`;

        // Multiplicateurs
        multObj = aviatorMultiplicateurs(h,m,s,multi);

        // Affichage des heures originales
        document.getElementById("time2").textContent = heure1;
        document.getElementById("time3").textContent = heure2;
        document.getElementById("time4").textContent = heure3;

        document.getElementById("safe1").textContent = multObj.safe;
        document.getElementById("mid1").textContent = multObj.mid;
        document.getElementById("big1").textContent = multObj.big;

        document.getElementById("orig2").style.display="flex";
        document.getElementById("orig3").style.display="flex";
        document.getElementById("orig4").style.display="flex";
    }

    // ---------- Sauvegarde historique ----------
    saveHistory({
        time1: predBlizzard.prediction,
        time2: heure1,
        time3: heure2,
        time4: heure3,
        safe: multObj?.safe,
        mid: multObj?.mid,
        big: multObj?.big
    });
});

renderHistory();
