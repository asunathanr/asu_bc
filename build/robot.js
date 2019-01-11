require('best_first_search.js');

var step = -1;


class MyRobot extends BCAbstractRobot {

    turn() {
        step++;
        if (this.me.unit === SPECS.CRUSADER) {
            // this.log("Crusader health: " + this.me.health);
            this.log("CRUSADER" + this.me.id);
            const choices = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
            var choice = [0, 0];
            var path = this.make_path([this.me.x, this.me.y], this.rand_coord());
            this.log(path.toString());
            // var choice = path.pop();
            return this.move(this.me.x - path[0], this.me.y - path[1]);
        }

        else if (this.me.unit === SPECS.CASTLE) {
            this.log("CASTLE");
            if (step % 10 === 0) {
                //this.log("Building a crusader at " + (this.me.x+1) + ", " + (this.me.y+1));
                return this.buildUnit(SPECS.CRUSADER, 1, 1);
            } else {
                return; // this.log("Castle health: " + this.me.health);
            }
        }

    }
    
    to_castle() {
        
    }
    
    rand_coord() {
        /**
        var n = neighbors([this.me.x, this.me.y], this.getPassableMap());
        var filtered_coords = [];
        for (var i = 0; i < n.length; ++i) {
            if (valid_coord(n[i], this.getPassableMap())) {
                filtered_coords.push(n[i]);
            }
        }
        */
        var pos = Math.floor(Math.random() * this.getPassableMap().length);
        return [pos, pos];
    }
    
    make_path(start, goal) {
        var path = breadth_first_search(
            this.getPassableMap(),
            start,
            goal
        );
        return path;
    }

    convert_boolean_map(map) {
        var converted_map = [];
        for (var i = 0; i < map.length; i++) {
            converted_map.push(map[i].map(Number));
        }
        return converted_map;
    }

    distance(p1, p2) {
        return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    }

}


var robot = new MyRobot();