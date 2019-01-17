rem File: compile.bat
rem Author: Nathan Robertson
rem Purpose: Compiles two battlecode bots using bc19compile.

xcopy "./state_bot/" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot/"
xcopy "./empty_bot/" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/empty_bot/"
cd "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/"
bc19compile -d "./my_bot/" -o "compiled_state_bot.js"
bc19compile -d "./empty_bot/" -o "compiled_empty_bot.js"