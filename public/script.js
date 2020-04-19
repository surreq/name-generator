var mymodel;
var myrmodel;
const max_sequence_len = 10
const lookup = 'esfutrmqaodhcilbnpgvx()'
const rules = []
const candidate_count = 5
function getTensor(indices){
    let padded = []
    for(var i=0;i<max_sequence_len-indices.length;i++){
        padded.push(0)
    }
    return tf.tensor([padded.concat(indices)])
}

function sortWithIndeces(toSort) {
    let result = []
    for (var i = 0; i < toSort.length; i++) {
        result[i] = [toSort[i], i];
    }
    result.sort(function(left, right) {
      return left[0] > right[0] ? -1 : 1;
    });
    result.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        result.sortIndices.push(result[j][1]);
        result[j] = result[j][0];
    }
    return result;
}

function predictNextChar(indices) {
    ts = getTensor(indices);
    let result = mymodel.predict(ts).dataSync();
    let max = result[0], maxId = 0;
    for (var i = 1; i < result.length; i++) {
        if (result[i] > max) {
            max = result[i];
            maxId = i;
        }
    }
    return maxId;
}

function predictPrevChar(indices) {
    ts = getTensor(indices.reverse());
    let result = myrmodel.predict(ts).dataSync();
    let max = result[0], maxId = 0;
    for (var i = 1; i < result.length; i++) {
        if (result[i] > max) {
            max = result[i];
            maxId = i;
        }
    }
    return maxId;
}

function predictNextChars(indices, count) {
    ts = getTensor(indices);
    let result = mymodel.predict(ts).dataSync();
    return sortWithIndeces(result).sortIndices.slice(0,count);
}


function predictPrevChars(indices, count) {
    ts = getTensor(indices.reverse());
    let result = myrmodel.predict(ts).dataSync();
    return sortWithIndeces(result).sortIndices.slice(0,count);
}

function predictNext(str, len){
    let result = []
    const indices = str.split('').map(char=> lookup.indexOf(char))
    let candidateChars = predictNextChars(indices.slice(), candidate_count)
    for(var i=0;i<candidate_count;i++){
        let candidate = indices.slice()
        candidate.push(candidateChars[i])
        for(var j=1;j<len;j++){
            let maxId = predictNextChar(candidate.slice());
            candidate.push(maxId)
        }
        result.push(candidate)
    }
    
    return result.map(idxs => idxs.map(idx=>lookup.charAt(idx)).join(''))

}

function predictPrev(str, len){
    let result = []
    const indices = str.split('').map(char=> lookup.indexOf(char))
    console.log(indices.join(','))
    let candidateChars = predictPrevChars(indices.slice(), candidate_count)
    for(var i=0;i<candidate_count;i++){
        let candidate = indices.slice()
        console.log(candidate.join(','))
        candidate.unshift(candidateChars[i])
        for(var j=1;j<len;j++){
            let maxId = predictPrevChar(candidate.slice());
            candidate.unshift(maxId)
        }
        console.log(candidate.join(','))
        result.push(candidate)
    }
    
    return result.map(idxs => idxs.map(idx=>lookup.charAt(idx)).join(''))

}

async function run() {
    // Create a simple model.
    const model = await tf.loadLayersModel('/out_p/model.json');
    mymodel = model
    const r_model = await tf.loadLayersModel('/out_r/model.json');
    myrmodel = r_model
  }
  

function generate(length) {
    var result  = makeup(3)
    if($('#startRule').val()){
        result = $('#startRule').val()
    }

    if($('#endRule').val()){
        result = $('#endRule').val()
        return predictPrev(result, length-3)

    }

    result = predictNext(result, length-3)

    return result;
} 

function makeup(length) {
    var result  = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
} 

function createRow(name){
    return `<tr>
            <td>${name}</td>
            <td>
                <button onclick='getDomain(name, this)'>check domain</button>
            </td>
          </tr>`
}
$(document).ready(function(){
    run().then(function(){
        //console.log(predict('pexa', 3))
    });

    $("#generateBtn").click(function(){
            $(".maincontainer").show()

            $("#nhistory>tbody").html('')
            generate(6).map(generated => $("#nhistory>tbody").append(createRow(generated)))
    })

    $(".dropdown").mouseover(function(){
        $(".dropdown input[type=checkbox] ~ ul").show()
    })
    $(".dropdown").mouseout(function(){
        $(".dropdown input[type=checkbox] ~ ul").hide()        
    })
})
//}
//        for(i=0;i<1000;i++){}