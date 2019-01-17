rem create my_bot directory if it doesn't exist.
if not exist "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot/" (
  echo "Creating my_bot directory."
  mkdir "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot/"
)

rem copy all relevant files from current directory to game directory.
copy "robot.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "astar_node.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "binary_heap.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "cache.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "horizontal_sym.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "nav.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "node.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "path.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "pathfinder.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "AbstractState.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "CastleState.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "CrusaderState.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"
copy "pilgrim_state.js" "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots/my_bot"

cd "c:/Users/absna/AppData/Roaming/npm/node_modules/bc19/bots"
rem Run instance of game with copied bots.
bc19run -r my_bot -b my_bot