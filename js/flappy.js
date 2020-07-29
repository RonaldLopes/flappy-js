function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}


function criaBarreira(reversa = false) {
    this.elemento = novoElemento('div','barreira')
    const borda = novoElemento('div','borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo:borda)
    this.elemento.appendChild(reversa ? borda:corpo)
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function parDeBarreiras(altura,abertura,x) {
    this.elemento = novoElemento('div','par-de-barreiras')
    this.superior = new criaBarreira(true)
    this.inferior = new criaBarreira(false)
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = ()=>{
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.resetX = () => this.setX(x)
    this.getX = () =>parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
    
}

function geraBarreiras(altura,largura,abertura,espaco,notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura,abertura,largura),
        new parDeBarreiras(altura,abertura,largura +espaco),
        new parDeBarreiras(altura,abertura,largura +espaco * 2),
        new parDeBarreiras(altura,abertura,largura +espaco *3),
    ]
    let deslocamento = 3
    this.incrementaDeslocamento = () => deslocamento+= 0.005

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX()-deslocamento)
            // console.log(deslocamento)


            // quando a barreira sai da tela

            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura /2 
            const cruzouOMeio = par.getX() + deslocamento >=meio && par.getX() < meio
            if(cruzouOMeio) notificarPonto() 
        })
    }
    this.resetParDeBarreiras = ()=>{
        deslocamento = 3
        this.pares.forEach(par => {
            par.setX(par.getX()-deslocamento)
            par.resetX()
        })
    }
}

function Passaro(alturaDoJogo) {
    let voando = false
    this.elemento = novoElemento('img','passaro')
    this.elemento.src = './imgs/passaro.png'
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    this.detectaComandos = ()=>{
        window.onkeydown = e => {
            if(e.key == ' ') voando = true
        }
        window.onkeyup = e => {
            if(e.key == ' ') voando = false
        }
    }

    this.animar = ()=> {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight

        if(novoY <=0){
            this.setY(0)
        }else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
        this.detectaComandos()
    }

    this.setY(alturaDoJogo/2)
}

function Progresso() {
    this.elemento = novoElemento('span','progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
    
}

function FlappyBird() {
    let pontos = 0
    let jogando = true
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    
    
    let progresso = new Progresso()
    const barreiras = new geraBarreiras(altura,largura,300,400,()=> progresso.atualizarPontos(++pontos))
    
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = ()=>{
        // loop do jogo
        jogando = true
        const temporizador = setInterval(()=>{
            barreiras.animar()
            passaro.animar()
            if (colidiu(passaro,barreiras)) {
                // console.log('colidiu')
                clearInterval(temporizador)
                jogando = false
                this.reset()
            }
            if(pontos%5 === 0 && pontos > 0){
                // console.log('ok')
                barreiras.incrementaDeslocamento()
            }
        },20)
    } 

    this.reset = () =>{
        const temporizadorDeEspera = setInterval(()=>{
            progresso.elemento.innerHTML = "Pressione R para jogar novamente"
            window.onkeydown = e => {
                if(e.key == 'r'){
                    // alert('Teste')
                    passaro.setY(altura/2)
                    progresso.atualizarPontos(0)
                    barreiras.resetParDeBarreiras()
                    this.start()
                    clearInterval(temporizadorDeEspera)
                }
            }
            
        },1)
    }

}

function estaoSobrepostos(elementoA,elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left +b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}


function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras=>{
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento,superior) || estaoSobrepostos(passaro.elemento,inferior)
        }
    })
    return colidiu
}


new FlappyBird().start()
// const b = new criaBarreira(true)
// b.setAltura(100)

// const b = new parDeBarreiras(700,200,400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)
// const barreiras = new geraBarreiras(700,1200,200,400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new progresso().elemento)
// barreiras.pares.forEach(bar => {
//     areaDoJogo.appendChild(bar.elemento)
// })

// setInterval(()=>{
//     barreiras.animar()
//     passaro.animar()
// },20)