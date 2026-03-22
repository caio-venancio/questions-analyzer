import * as os from 'os';
import { NodeFileProvider } from './nodeFileProvider.js';
import { MarkdownParser } from '../core/parser/markdownParser.js';
import { SqliteIndexStore } from '../core/index/sqliteIndexStore.js';
import { Indexer } from '../core/indexer.js'
import { SearchService } from '../core/search/searchService.js';
import { checkConfig, checkDirectoryPath, saveConfig, getConfig } from './nodeConfigService.js';
import { createInterface } from 'node:readline'
import { exit } from 'node:process';
import { DocumentValidator } from '../core/parser/documentValidator.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const perguntar = (query: string) => new Promise((resolve) => rl.question(query, resolve));

if (!checkConfig()){
    const answer = await perguntar('Qual diretório de homedir deseja colocar seus estudos? ');// tem que checar a segurança por ser entrada de usuário
    console.log(`Testando o diretório ${answer}...`);
    if(checkDirectoryPath(answer as string)){ //tem que mandar caminho completo kkk //tem que verificar tipo depois
        console.log('Sucesso, vamos configurar com esse caminho.')
        saveConfig(answer as string); //tem que verificar tipo depois
    } else {
        console.log('Não foi possível conferir este diretório, tente novamente.')
        exit(0)
    }
}



const perguntaDaInterface: string = `
    O que deseja realizar?
    Sair do programa - 0

    Mostrar qual pasta está configurada - 1

    Mostrar quais arquivos foram detectados - 2
    Verificar se há arquivos no padrão errado - 3
    Contar quantos arquivos de cada padrão tem - 4
    Mostra arquivos que estao sendo contabilizados em mais de um padrao - 13
    Mostrar todas as questões detectadas - 5
    Formatar uma questão para exemplo - 6
    Mostrar todos os capítulos detectados - 14
    Formatar um capítulo para exemplo - 17
    Mostrar todos os livros detectados - 12
    Formatar um livro para exemplo - 16
    Mostrar todas as perguntas comuns detectadas - 15
    Formatar uma pergunta comum para exemplo - 


    Mostrar banco de dados atual - 7
    Adicionar uma questão ao banco de dados atual - 8
    Adicionar um livro ao banco de dados atual - 18
    Adicionar um capitulo ao banco de dados atual - 19
    Verificar se tem questões com título repetido - 9
    Verificar se tem livros com título repetido - 20
    Verificar se tem Capítulos com título repetido -
    Verifica se tem novos exercícios - 10
    Verifica se tem novos livros -
    Verifica se tem novos capítulos -
    Adiciona questões no banco - 11
    Adiciona livros no banco -
    Adiciona Capítulos no banco -

    Adiciona disciplinas no banco - 22



`

const fileProvider = new NodeFileProvider();
const documentValidador = new DocumentValidator(fileProvider)
const markdownParser = new MarkdownParser()
const indexStore = new SqliteIndexStore();
const searchService = new SearchService(indexStore)


let answer = 1;
while(answer != 0){
    answer = await perguntar(perguntaDaInterface) as number

    if(answer == 1){
        console.log("Configuração para pasta", os.homedir() + '\\' + getConfig()?.targetFolder)
    }

    if(answer == 2){
        let list = await fileProvider.listMarkdownFiles()
        console.log("Lista de markdown:", list)
    }

    if(answer == 3){
        let badFormat = documentValidador.verifyTitles()
    }

    if(answer == 4){
        let questions = await documentValidador.onlyQuestionsTitle()
        let books = await documentValidador.onlyBooksTitle()
        let chapters = await documentValidador.onlyChaptersTitle()
        let CommonAsked = await documentValidador.onlyCommonAskedTitle()
        let list = await fileProvider.listMarkdownFiles()
        console.log(`
            Tem ${questions.length} perguntas.
            Tem ${books.length} livros.
            Tem ${chapters.length} capitulos.
            Tem ${CommonAsked.length} perguntas comuns.
            Contabilizados: ${questions.length + books.length + chapters.length + CommonAsked.length}
            Total: ${list.length}
            `)
    }

    if(answer == 5){
        let response = documentValidador.onlyQuestionsTitle()
        console.log("Essas são as questões detectadas:", await response)
    }

    if(answer == 6){
        let response = await documentValidador.onlyQuestionsTitle()
        if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedQuestion = await markdownParser.parseQuestion(content, filename)

            console.log("MarkdownParser.parseQuestion():", parsedQuestion)
        } else{
            console.log("Response em 6 falhou.")
        }
    }

    if(answer == 7){
        console.log("Banco atual:")
        indexStore.check()
    }

    if(answer == 8){
        let response = await documentValidador.onlyQuestionsTitle()
        console.log("salvando", response[1], "no banco")
         if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedQuestion = await markdownParser.parseQuestion(content, filename)

            console.log("indexStore.saveQuestion():", indexStore.saveQuestion(parsedQuestion))
            console.log("Chegando depois de adicionar:"), indexStore.check()
        } else{
            console.log("Response em 8 falhou.")
        }
    }

    if(answer == 9){
        let response = await documentValidador.verifyUniqueQuestionsTitles()
        console.log("este sao as perguntas com títulos repetidas ou erradas:", response)
    }

    if(answer == 10){
        let counter = 0;
        let questions = await documentValidador.onlyQuestionsTitle() 
        for (const question of questions) {
            try {
                const content = await fileProvider.readFile(question);
                const filename = await fileProvider.filenameOnly(question);
                const title = markdownParser.parseQuestion(content, filename).title
                if(!indexStore.verifyQuestion(title)){
                    console.log("Questao", title, "não está no banco.")
                }
                counter++;
            } catch (err) {
                console.log("Algo falhou no 10")
            }
        }
        console.log(counter, "questoes não estão no banco de dados.")
        console.log("Tem", questions.length, "questoes arquivos no docs.")
    }

    if(answer == 11){
        console.log("Adicionando novos exercícios...")
        let counter = 0;
        let savedCounter = 0;
        let questions = await documentValidador.onlyQuestionsTitle() 
        for (const question of questions) {
            try {
                const content = await fileProvider.readFile(question);
                const filename = await fileProvider.filenameOnly(question);
                const parsedQuestion = markdownParser.parseQuestion(content, filename)
                const title = parsedQuestion.title
                if(!indexStore.verifyQuestion(title)){
                    console.log("Questao", title, "não está no banco.")
                    indexStore.saveQuestion(parsedQuestion)
                    savedCounter++;
                }
                counter++;
            } catch (err) {
                console.log("Algo falhou no 11")
            }
        console.log(counter, "questoes analisadas.")
        console.log(savedCounter, "questoes nao estavam no banco de dados.")
        console.log("Tem", questions.length, "questoes arquivos no docs.")
        }
    }

    if(answer == 12){
        let response = documentValidador.onlyBooksTitle()
        console.log("Essas são os livros detectados:", await response)
    }

    if(answer == 13){
        let response = documentValidador.badRegexFiles()
        console.log("Estes sao os arquivos ambíguos:", await response)
    }

    if(answer == 14){   
        let response = documentValidador.onlyChaptersTitle()
        console.log("Estes sao os capitulos detectados:", await response)
    }

    if(answer == 15){
        let response = documentValidador.onlyCommonAskedTitle()
        console.log("Estes sao as perguntas comuns detectados:", await response)
    }

    if(answer == 16){
        let response = await documentValidador.onlyBooksTitle()
        if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedBook = await markdownParser.parseBook(content, filename)

            console.log("MarkdownParser.parseBook():", parsedBook)
        } else{
            console.log("Response em 16 falhou.")
        }
    }

    if(answer == 17){
        let response = await documentValidador.onlyChaptersTitle()
        if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedChapter = await markdownParser.parseChapter(content, filename)

            console.log("MarkdownParser.parseChapter():", parsedChapter)
        } else{
            console.log("Response em 17 falhou.")
        }
    }

    if(answer == 18){
        let response = await documentValidador.onlyBooksTitle()
        console.log("salvando", response[1], "no banco")
         if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedBook = await markdownParser.parseBook(content, filename)

            console.log("indexStore.saveBook():", indexStore.saveBook(parsedBook))
            console.log("Chegando depois de adicionar:"), indexStore.check()
        } else{
            console.log("Response em 18 falhou.")
        }
    }

    if(answer == 19){
        let response = await documentValidador.onlyChaptersTitle()
        console.log("salvando", response[1], "no banco")
         if(response[1]){
            const content = await fileProvider.readFile(response[1]);
            const filename = await fileProvider.filenameOnly(response[1]);
            const parsedQuestion = await markdownParser.parseChapter(content, filename)

            console.log("indexStore.saveChapter():", indexStore.saveChapter(parsedQuestion))
            console.log("Chegando depois de adicionar:"), indexStore.check()
        } else{
            console.log("Response em 19 falhou.")
        }
    }

    if(answer == 20){
        let response = await documentValidador.verifyUniqueBooksTitles()
        console.log("este sao os livros com títulos repetidos ou errados:", response)
    }

    if(answer == 21){
        console.log("Adicionando novos livros...")
        const cautela = await perguntar("Deseja adicionar com cautela? (s/n)") as string
        if(cautela === 's'){
            let counter = 0;
            let questions = await documentValidador.onlyBooksTitle() 
            for (const question of questions) {
                const aceito = await perguntar("Deseja processar " + question + "? (s/n)")
                if(aceito == 's'){
                    // let savedCounter = 0;
                    try {
                        const content = await fileProvider.readFile(question);
                        const filename = await fileProvider.filenameOnly(question);
                        const parsedBook = markdownParser.parseBook(content, filename)
                        const title = parsedBook.title
                        // if(!indexStore.verifyBook(title)){
                            // console.log("Questao", title, "não está no banco.")
                            indexStore.saveBook(parsedBook)
                            // savedCounter++;
                        // }
                        counter++;
                    } catch (err) {
                        console.log("Algo falhou no 21")
                    }
                } else {
                    continue
                }
            }
            console.log(counter, "questoes analisadas.")
            // console.log(savedCounter, "questoes nao estavam no banco de dados.")
            console.log("Tem", questions.length, "questoes arquivos no docs.")
        } else {
            console.log("Modo sem cautela ainda não foi implementado para adicionar livros.")
        }
    }

    if(answer == 22){
        let listOfBooks = searchService.getAllBooks()
        for (const book of listOfBooks){
            console.log("------", book, "-------")
            if(book.area){
                console.log("Este livro possui ")
                for (const area of book.area){
                    console.log(area)
                }
            } else {
                console.log("Este livro não possui areas/disciplinas definidas.")
            }


            const choice = await perguntar('Você quer cadastrar disciplina para ' + book.title + '? (s/n)')
            if(choice == 's'){
                console.log("Estou fingindo que estou colocando!")
            }
        }
    }
}
rl.close(); 

// Ponto de entrada do programa em CLI
// console.log("fileProvider:", fileProvider);
// console.log("Versão elegante do fileProvider:", JSON.parse(JSON.stringify(fileProvider)));

// const parser = new MarkdownParser();
// console.log("parser:", parser);
// console.log("Versão elegante do parser:", JSON.parse(JSON.stringify(parser)));

// const indexStore = new SqliteIndexStore();
// console.log("indexStore:", indexStore);
// console.log("Versão elegante do indexStore:", JSON.parse(JSON.stringify(indexStore)));

// const indexer = new Indexer(fileProvider, parser, indexStore);
// console.log("Indexer:", indexer);
// console.log("Versão elegante do Indexer:", JSON.parse(JSON.stringify(indexer)));
// await indexer.run();

// const searchService = new SearchService(indexStore);
// console.log("searchService:", searchService);
// console.log("Versão elegante do searchService:", JSON.parse(JSON.stringify(searchService)));

// const results = searchService.search({ text: "maclaurin" });
// console.log("results:", results[0]);
// console.log("Versão elegante do results:", JSON.parse(JSON.stringify(results)));

//    Object.entries(results).forEach(([chave, valor]) => {
//         Object.entries(valor).forEach(([chave1, valor1]) => {
//             Object.entries(valor1).forEach(([chave2, valor2]) => {
//                 if (chave2.includes("path")) {
//                     console.log(`Chave2: ${chave2}, Valor2: ${valor2}`);
//                 }
//             })
//         })
//    });

// console.log("arquivos markdown encontrados:", await fileProvider.listMarkdownFiles())

console.log("Thank you very much!")
