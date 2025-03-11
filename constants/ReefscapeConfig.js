export const config_data = `
{
  "dataFormat": "tsv",
  "title": "Scouting App 2025",
  "page_title": "REEFSCAPE",
  "checkboxAs": "10",
  "prematch": [
    { "name": "Scouter Initials",
      "code": "scouter_name",
      "type": "scouter",
      "size": 5,
      "maxSize": 5,
      "required": "true"
    },
    { "name": "Event",
      "code": "event",
      "type": "event",
      "defaultValue": "2025ilpe",
      "required": "true"
    },
    { "name": "Match Level",
      "code": "match_level",
      "type": "level",
      "choices": {
        "qm": "Quals<br>",
        "ef": "Eighth-Final<br>",
        "qf": "Quarter-Final<br>",
        "sf": "Semi-Final<br>",
        "f": "Final"
      },
      "defaultValue": "qm",
      "required": "true"
    },
    { "name": "Match #",
      "code": "match_number",
      "type": "match",
      "min": 1,
      "max": 100,
      "required": "true"
    },
    { "name": "Robot",
      "code": "robot",
      "type": "robot",
      "choices": {
        "r1": "Red-1",
        "b1": "Blue-1<br>",
        "r2": "Red-2",
        "b2": "Blue-2<br>",
        "r3": "Red-3",
        "b3": "Blue-3"
      },
      "required":"true"
    },
    { "name": "Team #",
      "code": "team_number",
      "type": "team",
      "min": 1,
      "max": 99999
    },
    { "name": "Auto Start Position",
      "code": "auto_start_position",
      "type": "field_image",
      "filename": "field_image.png",
      "clickRestriction": "one",
      "shape": "circle",
      "diameter": 20
    }
  ],
  "auton": [
    { "name": "Mobility",
      "code": "mobility",
      "type": "bool"
    },
    { "name": "Crossed Line",
      "code": "crossed_line",
      "type": "bool"
    },
    { "name": "Coral Scored Location",
      "code": "coral_scored_location",
      "type": "radio",
      "choices": {
        "barge": "Barge",
        "processor": "Processor",
        "both": "Both"
      },
      "defaultValue": "none"
    },
    { "name": "Coral Level 1",
      "code": "auton_coral_l1",
      "type": "counter"
    },
    { "name": "Coral Level 2",
      "code": "auton_coral_l2",
      "type": "counter"
    },
    { "name": "Coral Level 3",
      "code": "auton_coral_l3",
      "type": "counter"
    },
    { "name": "Coral Level 4",
      "code": "auton_coral_l4",
      "type": "counter"
    },
    { "name": "Processor Score",
      "code": "auton_processor_score",
      "type": "counter"
    },
    { "name": "Net Score",
      "code": "auton_net_score",
      "type": "counter"
    },
    { "name": "Scoring Positions",
      "code": "auton_scoring_positions",
      "type": "field_image",
      "filename": "field_image.png",
      "clickRestriction": "many",
      "shape": "circle",
      "diameter": 20
    }
  ],
  "teleop": [
    { "name": "Coral Level 1",
      "code": "teleop_coral_l1",
      "type": "counter"
    },
    { "name": "Coral Level 2",
      "code": "teleop_coral_l2",
      "type": "counter"
    },
    { "name": "Coral Level 3",
      "code": "teleop_coral_l3",
      "type": "counter"
    },
    { "name": "Coral Level 4",
      "code": "teleop_coral_l4",
      "type": "counter"
    },
    { "name": "Processor Score",
      "code": "teleop_processor_score",
      "type": "counter"
    },
    { "name": "Net Score",
      "code": "teleop_net_score",
      "type": "counter"
    },
    { "name": "Algae Processor",
      "code": "teleop_algae_processor",
      "type": "counter"
    },
    { "name": "Algae Net",
      "code": "teleop_algae_net",
      "type": "counter"
    },
    { "name": "Scored Far Side",
      "code": "scored_far_side",
      "type": "bool"
    },
    { "name": "Algae Removed",
      "code": "algae_removed",
      "type": "bool"
    },
    { "name": "Robot Died",
      "code": "robot_died",
      "type": "bool"
    },
    { "name": "Played Defense",
      "code": "played_defense",
      "type": "bool"
    },
    { "name": "Cage Hang",
      "code": "cage_hang",
      "type": "radio",
      "choices": {
        "deep": "Deep",
        "shallow": "Shallow",
        "line": "Line"
      },
      "defaultValue": "none"
    }
  ],
  "endgame": [
    { "name": "On Stage",
      "code": "on_stage",
      "type": "bool"
    },
    { "name": "Spotlit",
      "code": "spotlit",
      "type": "bool"
    },
    { "name": "Harmony",
      "code": "harmony",
      "type": "bool"
    },
    { "name": "Trap",
      "code": "trap",
      "type": "bool"
    },
    { "name": "Parked",
      "code": "parked",
      "type": "radio",
      "choices": {
        "not_attempted": "Not Attempted",
        "failed": "Failed",
        "successful": "Successful"
      },
      "defaultValue": "not_attempted"
    },
    { "name": "Driver Skill",
      "code": "driver_skill",
      "type": "radio",
      "choices": {
        "not_attempted": "Not Attempted",
        "failed": "Failed",
        "successful": "Successful"
      },
      "defaultValue": "not_attempted"
    },
    { "name": "Speed Rating",
      "code": "speed_rating",
      "type": "radio",
      "choices": {
        "not_attempted": "Not Attempted",
        "failed": "Failed",
        "successful": "Successful"
      },
      "defaultValue": "not_attempted"
    },
    { "name": "Defense Rating",
      "code": "defense_rating",
      "type": "radio",
      "choices": {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5"
      },
      "defaultValue": "1"
    },
    { "name": "Comments",
      "code": "comments",
      "type": "text",
      "size": 15,
      "maxSize": 50
    },
    { "name": "Red Alliance Score",
      "code": "red_alliance_score",
      "type": "text",
      "size": 2,
      "maxSize": 3
    },
    { "name": "Blue Alliance Score",
      "code": "blue_alliance_score",
      "type": "text",
      "size": 2,
      "maxSize": 3
    }
  ]
}`;
