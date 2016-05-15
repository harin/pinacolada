var bc = require('./bc.js');

//FSM indexed by MID
var FSM = {};
const STATE = {
    IDLE: 'IDLE',
    WAIT_LOCATION: 'WAIT_LOCATION',
    DONT_UNDERSTAND: 'DONT_UNDERSTAND',
    SUGGEST: 'SUGGEST',
    FEEDBACK: 'FEEDBACK',
    COMPARISON: 'COMPARISON'
};

const INTENT = {
    INQUIRY: 'INQUIRY',
    UNKNOWN: 'UNKNOWN',
    LOCATION: 'LOCATION',
    SURPRISE: 'SURPRISE',
    SATISFIED: 'SATISFIED',
    CUISINE: 'CUISINE',
    UNSATISFIED: 'UNSATISFIED',
    RESET: 'RESET',
    FEEDBACK: 'FEEDBACK',
    COMPARISON: 'COMPARISON'
}

function updateNextState(mid, intent){
    //At any state, reset
    if(intent == INTENT.RESET){
       FSM[mid] = STATE.IDLE;
       return FSM[mid];
    }
    
    //Special state where user can compare A and B
    if(intent == INTENT.COMPARISON){
       FSM[mid] = STATE.COMPARISON;
       return FSM[mid];
    }
    
    switch(FSM[mid]){
           case STATE.IDLE:
                if(intent == INTENT.INQUIRY){
                    FSM[mid] = STATE.WAIT_LOCATION;
                }else{
                    FSM[mid] = STATE.DONT_UNDERSTAND;
                }
           break;
           case STATE.WAIT_LOCATION:
                if(intent == INTENT.LOCATION){
                    FSM[mid] = STATE.SUGGEST;
                }else{
                    FSM[mid] = STATE.WAIT_LOCATION;
                }
           break;
           case STATE.DONT_UNDERSTAND:
                FSM[mid] = STATE.IDLE;
           break;
           case STATE.SUGGEST:
                if(intent == INTENT.SURPRISE){
                    FSM[mid] = STATE.SUGGEST;
                }else if(intent == INTENT.UNSATISFIED){
                    FSM[mid] = STATE.SUGGEST;
                }else if(intent == INTENT.CUISINE){
                    FSM[mid] = STATE.SUGGEST;
                }else if(intent == INTENT.SATISFIED){
                    FSM[mid] = STATE.FEEDBACK;
                } else {
                    FSM[mid] = STATE.SUGGEST;
                }
           break;
           case STATE.FEEDBACK:
            if(intent == INTENT.FEEDBACK){
                FSM[mid] = STATE.IDLE;
            }else{
              FSM[mid] = STATE.FEEDBACK;
            }
           break;
           case STATE.COMPARISON:
            if(intent == INTENT.SATISFIED){
                FSM[mid] = STATE.FEEDBACK;
            }else{
                FSM[mid] = STATE.IDLE;
            }
           break;
       }
}

module.exports = {
    idle: function(mid){
         FSM[mid] = STATE.IDLE;
    },
    clockNext : function(mid, intents){
       if(!FSM[mid]){
          //no state initialize to idle
          //FSM[mid] =  STATE.IDLE;
          bc.sendText([mid], "Hi! I'm Pin. Nice to meet you. First please introduce yourself.");
          bc.sendLink([mid], 'template1');
          return null;
       }
       //determine next state
       for(var i = 0; i < intents.length; i++){
           updateNextState(mid, intents[i]);
       }
       
       return FSM[mid];
    },
    getState: function(mid){
    //   if (!FSM[mid]) {
    //     FSM[mid] = STATE.IDLE;
    //     bc.sendLink([mid], 'template1');
    //     return null;
    //   }
      return FSM[mid];
    }
}}