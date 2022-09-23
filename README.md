Skill Challenge v 1.0
Welcome to Skill Challenge. This script helps in creating a Skill Challenge for your players without having to track each roll an Successes or Failures.

Using Skill Challenge
The script will prompt inputs from GM and Players. The GM can set the DC for the Challenge and how many Successes are needed to complete the Challenge. Failures will always be Successes divided by 2 rounded up. 

Basic Commands
The script uses a standardized API command syntax. All Skill Challenge commands will begin with !sk. This will then be followed by a space, a double dash preceding a keyword. This looks like this:

!sc --showChallenge

Setting up Skill Challenge
After installing the script and reloading the sandbox, Skill Challenge will create 7 new macros. For the GM are the following necessary:

API-SkillChallenge-Start , API-SkillChallenge-Show , API-SkillChallenge-Stop

As GM you should show them in your macro bar, for easy use.

Using Skill Challenge
Start by using the API-SkillChallenge-Start macro. This will give you 3 Options.

Set DC - Here you can set the DC for the Challenge.

Hide DC - Here you can toggle to hide the DC or show it.

Set Success/Failures - Here you can set the Successes needed to complete the Skill Challenge

After setting everything up, use the API-SkillChallenge-Show macro.

Now Players can select a skill with the Select Skill button in the chat. After submitting a skill roll will be shown for the character. If the roll succeeded or failed will also be shown. The details of the roll will be whispered to the player. It will be shown how many successes and failures the party currently have, and a new prompt for the Select Skill will pop up in the chat.

The Skill Challenge ends when the Successes reach the max amount or the Failures. As GM you can use the API-SkillChallenge-Stop macro to preemptively stop the Skill Challenge. Maybe the party got into a fight, who knows.


