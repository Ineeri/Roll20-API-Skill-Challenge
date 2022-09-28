(() => {
	//VARs Region
	const VERSION = 1.0;

	const macroNames = ["API-SkillCha-Hide-DC", "API-SkillCha-Select-Skill",
						"API-SkillCha-Set-DC", "API-SkillCha-Set-Successes",
						"API-SkillChallenge-Show","API-SkillChallenge-Start",
						"API-SkillChallenge-Stop"];

	var inChallenge = false;

	const skills = ['Acrobatics', 'Animal Handling', 'Arcana', "Athletics", 
					"Deception", "History", "Insight", "Intimidation", 
					"Investigation", "Medicine", "Nature", "Perception", 
					"Performance", "Persuasion", "Religion", 
					"Sleight of Hand", "Stealth", "Survival"];
	const skillsWithBlank = ['Animal Handling', "Sleight of Hand"];

	var currentDc = 0;			
	var currentPlayerSkill = "";
	var maxSuccesses = 0;
	var maxFailures = 0; 
	var currentSuccesses = 0;		
	var currentFails = 0;
	var currentPlayer = "";
	var currentCharacter = "";
	var isGM = false;
	var dcHidden = false;

	//rolls
	var skillRoll = 0; //1d20
	var skillBonus = 0;
	var profBonus = 0;
	var skillCheck = 0;

	//VARs Region END

	function resetVars(){
		inChallenge = false;
		currentDc = 0;
		currentPlayerSkill = "";
		maxSuccesses = 0;
		maxFailures = 0;
		currentSuccesses = 0;		
		currentFails = 0;
		currentPlayer = "";
		currentCharacter = "";
		isGM = false;
		skillRoll = 0;
		skillBonus = 0;
		profBonus = 0;
		skillCheck = 0;
		dcHidden = false;
	}

	//check if Skill Challenge is beeing used the first time.
	on("ready", function(){
		hasAllMacros();
	})
	function hasAllMacros(){
		for(let i = 0; i < macroNames.length;i++){
			let macro = findObjs({ _type: "macro", name: macroNames[i]})[0];
			if(!macro){
				log("Skill Challenge --> Macro: " + macroNames[i] + " NOT Found!");
				log("Skill Challenge --> Creating Macro: " + macroNames[i]);
				createMacros(macroNames[i]);
			}
		}
		log("Skill Challenge --> All Macros Ready");
	}
	function createMacros(macroname){
		let players = findObjs({_type:"player"}).filter(p => playerIsGM(p.get('_id')));
		let API_SkillCha_Hide_DC = {
			name: "API-SkillCha-Hide-DC",
			action: "!skillCha --toggleDC",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")
		}
		let API_SkillCha_Select_Skill = {
			name: "API-SkillCha-Select-Skill",
			action: "!skillCha --skill ?{Select your skill|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival}",
			istokenaction: false,
			visibleto: "all",
			_playerid: players[0].get("id")		
		}
		let API_SkillCha_Set_DC = {
			name: "API-SkillCha-Set-DC",
			action: "!skillCha --dc ?{Set DC}",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")		
		}
		let API_SkillCha_Set_Successes = {
			name: "API-SkillCha-Set-Successes",
			action: "!skillCha --successes ?{Success Count}",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")		
		}
		let API_SkillChallenge_Show = {
			name: "API-SkillChallenge-Show",
			action: "!skillCha --showChallenge",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")		
		}
		let API_SkillChallenge_Start = {
			name: "API-SkillChallenge-Start",
			action: "!skillCha --startChallenge",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")		
		}
		let API_SkillChallenge_Stop = {
			name: "API-SkillChallenge-Stop",
			action: "!skillCha --stopChallenge",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")		
		}
		switch(macroname){
			case "API-SkillCha-Hide-DC":
				createObj("macro", API_SkillCha_Hide_DC);
			break;
			case "API-SkillCha-Select-Skill":
				createObj("macro", API_SkillCha_Select_Skill);
			break;
			case "API-SkillCha-Set-DC":
				createObj("macro", API_SkillCha_Set_DC);
			break;
			case "API-SkillCha-Set-Successes":
				createObj("macro", API_SkillCha_Set_Successes);
			break;
			case "API-SkillChallenge-Show":
				createObj("macro", API_SkillChallenge_Show);
			break;
			case "API-SkillChallenge-Start":
				createObj("macro", API_SkillChallenge_Start);
			break;
			case "API-SkillChallenge-Stop":
				createObj("macro", API_SkillChallenge_Stop);
			break;
		}
		
	}


	//main
	on("chat:message", function(msg){
		
		//only continue when chatmessage is an !api message
		if(msg.type !== "api"){
			return;
		}
		if(msg.content === "!"){
			return;
		}
		msgArgs = msg.content.split(" ");	
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--startChallenge" && inChallenge === false){
			inChallenge = true;		
			setDc();
			setSuccesses();
		}	
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--stopChallenge" && inChallenge === true){		
			resetVars();
		}
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--showChallenge"){	
			if(currentDc !== 0 && maxSuccesses !== 0){	
				sendChat("SkillChallenge", " &{template:desc} {{desc=A new Skill Challenge has begun!}}");
				showPlayers();
				getSkill();
			}
		}
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--toggleDC"){
			dcHidden = !dcHidden;
			if(dcHidden){
				sendChat("SkillChallenge", "/w gm &{template:desc} {{desc=DC will be hidden}}");
			}else{
				sendChat("SkillChallenge", "/w gm &{template:desc} {{desc=DC will be shown}}");
			}		
		}
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--dc"){
			currentDc = msgArgs[2];
		}
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--successes"){
			maxSuccesses = msgArgs[2];
			maxFailures = Math.ceil(maxSuccesses/2);
		}
		if(msgArgs[0] === "!skillCha" && msgArgs[1] === "--skill"){
			currentPlayerSkill = skillHandling(msgArgs[2]);	
			currentPlayer = getPlayer(msg.playerid);
			currentCharacter = getCharacter(currentPlayer.get("id"));
		}
		
		if(inChallenge){
			if(currentDc !== 0 && maxSuccesses !== 0){
				if(currentPlayerSkill !== ""){				
					getSkillCheck();
					presentSkillCheck();
					if(hasSkillChallengeEnded() == true){
						resetVars();
					}else{
						presentProgress();
					}
				}
			}
		}
		
	})
	function setDc(){
		sendChat("SkillChallenge", "/w gm &{template:desc} {{desc=[Set DC](!&#13;#API-SkillCha-Set-DC)}}");
		sendChat("SkillChallenge", "/w gm &{template:desc} {{desc=[Hide DC](!&#13;#API-SkillCha-Hide-DC)}}");
	}

	function setSuccesses(){
		sendChat("SkillChallenge", "/w gm &{template:desc} {{desc=[Set Success/Failures](!&#13;#API-SkillCha-Set-Successes)}}");
	}

	function showPlayers(){	
		if(dcHidden){
			sendChat("SkillChallenge", " &{template:simple} {{r1=Secret}} {{r2= " + maxSuccesses + "}} {{charname=DC to Beat / Successes Needed}} {{always=1}}");	
		}else{
			sendChat("SkillChallenge", " &{template:simple} {{r1=" + currentDc + "}} {{r2= " + maxSuccesses + "}} {{charname=DC to Beat / Successes Needed}} {{always=1}}");		
		}	
	}

	function getSkill(){
		sendChat("SkillChallenge", " &{template:desc} {{desc=[Select Skill](!&#13;#API-SkillCha-Select-Skill)}}");
	}

	function skillHandling(skill){
		let playerSkill = skill;
		playerSkill = playerSkill.toLowerCase();
		
		
		if(playerSkill == "animal"){
			playerSkill = skillsWithBlank[0]
		}
		if(playerSkill == "sleight"){
			playerSkill = skillsWithBlank[1]
		}
		
		log("playerSkill: " + playerSkill);
		for(let i = 0; i < skills.length; i++){
			if(playerSkill == skills[i].toLowerCase()){
				return skills[i];
			}			
		}
		return "";
	}

	function getPlayer(playerid){
		let player = findObjs({ _type: "player", _id: playerid})[0];
		return player;
	}

	function getCharacter(playerid){
		let character = findObjs({ _type: "character", controlledby: playerid});
		if(playerIsGM(playerid)){
			character = findObjs({ _type: "character", name: "Lux"})[0];
		}	
		return character;
	}

	function getSkillCheck(){
		
		skillRoll = randomInteger(20);
		skillBonus = getAttribute(currentCharacter.get("id"), currentPlayerSkill);
		skillCheck = Number(skillRoll) + Number(skillBonus) + Number(profBonus);
		log("skillRoll: " + skillRoll + " skillBonus: " + skillBonus + " profBonus: " + profBonus);
		if(checkifSuccessOrFailure() == "Success!" ){
			currentSuccesses++;
		}else{
			currentFails++;
		}	
	}

	function getAttribute(charid, skill){
		let attri = findObjs({ _type: "attribute", _characterid: charid, name: skillHandlingForSearch(skill)})[0];
		let attriBonus = attri.get("current");
		
		if(Number.isInteger(attriBonus)){
			profBonus = 0;
		}else{
			if(attriBonus.includes("+")){
				profBonus = attriBonus.split("+")[1];
				profBonus = randomInteger(profBonus.split("d")[1]);
				attriBonus = attriBonus.split("+")[0];
			}
		}	
		return attriBonus;
	}

	function skillHandlingForSearch(skill){	
		skill = skill.toLowerCase();
		skill = skill.replace(" ", "_");	
		skill = skill + "_bonus";
		return skill;
	}

	function presentSkillCheck(){	
		sendChat("SkillChallenge", " &{template:simple} {{rname=" + currentCharacter.get("name")+ "'s Skill Check VS DC}} {{r1=" +skillCheck+"}} {{r2="+currentDc+"}}{{always=1}}{{charname="+checkifSuccessOrFailure()+"}}");
		sendChat("SkillChallenge", "/w "+ currentPlayer.get("displayname") + " &{template:desc}{{desc=Your SkillRoll: " + skillRoll + "/20 + SkillBonus: " + skillBonus + "+ ProfBonus: " + profBonus+"}}");
	}

	function checkifSuccessOrFailure(){
		if(skillCheck >= currentDc){		
			return "Success!";
		}else{		
			return "Fail!";
		}
	}

	function hasSkillChallengeEnded(){
		if(currentSuccesses == maxSuccesses){
			sendChat("SkillChallenge", " &{template:desc} {{desc=The Skill Challenge has Succeeded! You WON!}}");
			return true;
		}
		if(currentFails == maxFailures){
			sendChat("SkillChallenge", " &{template:desc} {{desc=The Skill Challenge has Failed!}}");
			return true;
		}
		return false;
	}

	function presentProgress(){	
		sendChat("SkillChallenge"," &{template:desc}{{desc=You currently have: " + currentSuccesses + "/" + maxSuccesses +  " Successes}}"); 
		sendChat("SkillChallenge"," &{template:desc}{{desc=You currently have: " + currentFails + "/" + maxFailures +  " Failures }}")
		sendChat("SkillChallenge"," &{template:desc}{{desc=[Select Skill](!&#13;#API-SkillCha-Select-Skill)}}");
	}

})();