//isHorizontalReflection
	//grid 2d boolean array where true is passable terrain.
	//
	//returns true if map is horizontaly symmetric
	//returns false if map is vertically symmetric
function isHorizontalReflection(grid){
		//check NW quad against its neighbor quads
		for(var i=0;i<Math.floor(grid.length/2);i++){
			for(var j=0;j<Math.floor(grid.length/2);j++){
				//check against NE quad
				//might be vertically symmetric
				if(grid[j][i]===grid[j][grid.length-i-1]){
					//may be coincidence check SW quad
					//is coincidence
					if(grid[j][i]===grid[grid.length-j-1][i]){
						continue;
					}
					//not coincidence is vertically symmetric
					else{
						return false;
					}
				}
				//is horizontal reflection
				else{
					return true;
				}
			}
		}
		//todo: implement handling for perfectly symmetric map
		return Error('failed to compute map symmetry');
	}

	export { isHorizontalReflection };