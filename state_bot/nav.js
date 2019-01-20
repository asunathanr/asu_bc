import helper from './helper.js';
import BinaryHeap from './binary_heap.js';

const nav = {};

nav.compass = [
    ['NW', 'N', 'NE'],
    ['W', 'C', 'E'],
    ['SW', 'S', 'SE'],
];

nav.rotateArr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
nav.rotateArrInd = {
    'N': 0,
    'NE': 1,
    'E': 2,    
    'SE': 3,
    'S': 4,
    'SW': 5,
    'W': 6,
    'NW': 7,
};

nav.compassToCoordinate = {
    'N': {x: 0, y: -1},
    'NE': {x: 1, y: -1},
    'NW': {x: -1, y: -1},
    'E': {x: 1, y: 0},
    'W': {x: -1, y: 0},
    'S': {x: 0, y: 1},
    'SE': {x: 1, y: 1},
    'SW': {x: -1, y: 1},
};

nav.toCompassDir = (dir) => {
    return nav.compass[dir.y + 1][dir.x + 1];
};

nav.toCoordinateDir = (dir) => {
    return nav.compassToCoordinate[dir];
};

nav.rotate = (dir, amount) => {
    const compassDir = nav.toCompassDir(dir);
    const rotateCompassDir = nav.rotateArr[(nav.rotateArrInd[compassDir] + amount) % 8];
    return nav.toCoordinateDir(rotateCompassDir);
};

nav.reflect = (loc, fullMap, isHorizontalReflection) => {
    const mapLen = fullMap.length;
    const hReflect = {
        x: loc.x,
        y: mapLen - loc.y - 1,
    };
    const vReflect = {
        x: mapLen - loc.x - 1,
        y: loc.y,
    };

    if (isHorizontalReflection) {
        return fullMap[hReflect.y][hReflect.x] ? hReflect : vReflect;
    } else {
        return fullMap[vReflect.y][vReflect.x] ? vReflect : hReflect;
    }
};

nav.getDir = (start, target) => {
    const newDir = {
        x: target.x - start.x,
        y: target.y - start.y,
    };

    if (newDir.x < 0) {
        newDir.x = -1;
    } else if (newDir.x > 0) {
        newDir.x = 1;
    }

    if (newDir.y < 0) {
        newDir.y = -1;
    } else if (newDir.y > 0) {
        newDir.y = 1;
    }

    return newDir;
};

nav.isPassable = (loc, fullMap, robotMap) => {
    const {x, y} = loc;
    const mapLen = fullMap.length;
    if (x >= mapLen || x < 0) {
        return false;
    } else if (y >= mapLen || y < 0) {
        return false;
    } else if (robotMap[y][x] > 0 || !fullMap[y][x]) {
        return false;
    } else {
        return true;
    }
};

nav.applyDir = (loc, dir) => {
    return {
        x: loc.x + dir.x,
        y: loc.y + dir.y,
    };
};

nav.goto = (loc, destination, fullMap, robotMap) => {
    let goalDir = nav.getDir(loc, destination);
    if (goalDir.x === 0 && goalDir.y === 0) {
        return goalDir;
    }
    let tryDir = 0;
    while (!nav.isPassable(nav.applyDir(loc, goalDir), fullMap, robotMap) && tryDir < 8) {
        goalDir = nav.rotate(goalDir, 1);
        tryDir++;
    }
    return goalDir;
};

nav.sqDist = (start, end) => {
    return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
};

nav.getClosestResource = (loc, resourceMap) => {
    const mapLen = resourceMap.length;
    let closestLoc = null;
    let closestDist = 100000; // Large number;
    for (let y = 0; y < mapLen; y++) {
        for (let x = 0; x < mapLen; x++) {
            if (resourceMap[y][x] && nav.sqDist({x,y}, loc) < closestDist) {
                closestDist = nav.sqDist({x,y}, loc);
                closestLoc = {x,y};
            }
        }
    }
    return closestLoc;
};

nav.isHorizontalReflection = (grid) => {
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
    throw Error('failed to compute map symmetry');
};

/**
 * helper function to get lower and upper bounds of a map half
 * @param: coordinate to compute half {x,y}
 * @param: grid the passable map grid of MyRobot object
 * @returns: {xlo,xhi,ylo,yhi} object where each attribute is a number defining a bound.
 */
nav.getHalfBounds = (cell,grid) => {
    if(nav.isHorizontalReflection(grid)){
        if(cell.y < grid.length/2){
            return {xlo:0, xhi:grid.length, ylo:0, yhi:Math.floor(grid.length/2)};
        }
        else {
            return {xlo:0, xhi:grid.length, ylo:Math.floor(grid.length/2), yhi:grid.length};
        }
    }
    else {
        if(cell.x < grid.length/2) {
            return {xlo:0, xhi:Math.floor(grid.length/2), ylo:0, yhi:grid.length};
        }
        else {
            return {xlo:Math.floor(grid.length/2), xhi:grid.length, ylo:0, yhi:grid.length};
        }
    }
}

/**
 * calculates potential expansion locations
 * @param robot: { MyRobot } object
 * @param bounds: {xlo:,xhi:,ylo:,yhi:} object describing the bounds to be searched for resources
 * @returns: { BinaryHeap } of locations objects {x:,y:}
 */
nav.getExpansionLocs = (robot,bounds) => {
    //this is pretty bad using negative sign to make this a 'max' heap
    let expansionLocs = new BinaryHeap(function(element) {return -element['resources'];});

    for(let x=bounds.xlo;x<bounds.xhi;x++){
        for(let y=bounds.ylo;y<bounds.yhi;y++){
            let r = nav.expansionCriteria(robot,x,y);
            if(r >= 2){
                expansionLocs.push({'x':x,'y':y,'resources':r});
            }
        }
    }

    return expansionLocs;
}

/**
 * helper function for getExpansionLoc, returns the number of resources adjacent to a coordinate
 * @param robot: MyRobot object
 * @param x:
 * @param y:
 * @returns: the number of resources adjacent to the coordinate
 */
nav.expansionCriteria = (robot,x,y) => {
    let resources = 0;
    let directions = [{x: 0, y: -1},{x: 1, y: 0},{x: -1, y: 0},{x: 0, y: 1},
                        {x: 1, y: 1},{x: -1, y: 1},{x: 1, y: -1},{x: -1, y: -1}];
    if(robot.map[y][x] && !robot.karbonite_map[y][x] && !robot.fuel_map[y][x]){
        for(let i of directions){
            if(x+i.x>=0 && x+i.x<robot.map.length && y+i.y>=0 && y+i.y<robot.map.length) {
                    if(robot.karbonite_map[y+i.y][x+i.x] || robot.fuel_map[y+i.y][x+i.x]) {
                        resources++;
                    }
            }
        }
    }   
    if(resources >= 2) {
        robot.log(x+','+y+' has '+resources+' resources');
    }
    return resources;
}

nav.getRandHalfGrid = (crusader) => {
    return {x:0, y:0};
};

export default nav;
