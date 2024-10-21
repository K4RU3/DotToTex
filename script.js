/**
 * @type {Set<string>}
 */
let colors

function pix(hex, filename) {
    const [r = -1, g = -1, b = -1, a = 255] = hex.match(/[a-fA-F0-9]{2}/g)?.map(v => parseInt(v, 16)) || [];
    if (r !== -1 && g !== -1 && b !== -1) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        ctx.fillRect(0, 0, 1, 1);
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = filename || "color.png";
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return link;
    } else {
        throw new Error("Invalid Hex");
    }
}

function parseFile(context){
    try{
        const split = context.split(":").slice(0, 3).map(v => v.split(",").map(v=>parseInt(v)))
        let [[w, h], cells, color] = split
        if(w && h && cells && color){
            let useColors = new Set()
            color = color.map(v => `:1pix_${v.toString(16).padStart(6, '0')}:`).map(v => v===":1pix_000000:"?":1pb:":v===":1pix_ffffff:"?":1pw:":v)
            color[color.length - 1] = ":1pc:"
            cells = cells.map((v, i)=>{
                const match = color[v].match(/^:1pix_([0-9a-f]{6}):$/)
                if(match) useColors.add(match[1])
                return color[v]
            })
            console.log(color)
            return [Array.from({length: h}, (v, i)=>cells.slice(i*w, (i + 1)*w).join("")).join("\n"), useColors]
        }else{
            throw new Error("Invalid file")
        }
    }catch(e){
        console.error(e)
    }
}

document.querySelector("#input").addEventListener("change", (e)=>{
    const file = e.target.files[0]
    if(file){
        const reader = new FileReader()
        reader.onload = (e) => {
            const fileContext = e.target.result
            const result = parseFile(fileContext)
            document.querySelector("#result").textContent = result[0]
            colors = result[1]
        }
        reader.readAsText(file)
    }
})

document.querySelector("#copy").addEventListener("click", ()=>{
    navigator.clipboard.writeText(document.querySelector("#result").textContent).then(e=>{
        document.querySelector("#copyResult").textContent = "success to copy!!!"
    })
})

document.querySelector("#downloads").addEventListener("click", ()=>{
    colors.forEach(v=>pix(v, `1pix_${v}`))
})