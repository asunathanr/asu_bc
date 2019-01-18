rem create my_bot directory if it doesn't exist.
if not exist "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot/" (
  echo "Creating my_bot directory."
  mkdir "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot/"
)


rem copy all relevant files from current directory to game directory.
xcopy . "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot" /Y /S


cd "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots"
rem Run instance of game with copied bots.
bc19run -r "my_bot" -b "example_js"