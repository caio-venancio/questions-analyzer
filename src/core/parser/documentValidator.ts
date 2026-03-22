import type { FileProvider } from "./fileProvider";
type filesVerified = Record<string,string>

export class DocumentValidator {
  private bookPattern: RegExp;
  private titleBookPattern: RegExp;
  private chapterPattern: RegExp;
  private titleChapterPattern: RegExp;
  private commonAskedPattern: RegExp;
  private titleCommonAskedPattern: RegExp;
  private questionPattern: RegExp;
  private titleQuestionPattern: RegExp;
  private answeredPattern: RegExp;


  constructor(
    private readonly fileProvider: FileProvider,
  ) {
    this.bookPattern = /./;
    this.titleBookPattern = /^(?!Capítulo\b)(?!P\d+\.\d+[a-zA-Z]*\b)(?!Perguntas\b)(.+?) - (?:(\d+)ed - )?(.+)\.md$/;
    this.chapterPattern = /./;
    this.titleChapterPattern = /^Cap[ií]tulo (\d+) - ([A-Za-z0-9&]+)(?: - (.+))?$/;
    this.commonAskedPattern = /./;
    this.titleCommonAskedPattern = /^Pergunta[s]?\s+Comum(?:\s+(\d+))?\s+[-–—]\s+(.+?)\s+[-–—]\s+Cap[ií]tulo\s+(\d+)(?:\.md)?$/iu;
    this.questionPattern = /./;
    this.titleQuestionPattern = /^([A-Za-z])(\d+)\.(\d+) - ([A-Za-z0-9&]+) - (.+)$/;
    this.answeredPattern = /./;
  }

  async verifyTitles(): Promise<filesVerified> {
    const files = await this.fileProvider.listMarkdownFiles();
    const badFormat: Record<string, string> = {};

    for (const [index, path] of files.entries()){
      try {
        const filename = this.fileProvider.filenameOnly(path)
        let isBook = this.titleBookPattern.test(filename)
        let isChapter = this.titleChapterPattern.test(filename)
        let isCommonAsked = this.titleCommonAskedPattern.test(filename)
        let isQuestion = this.titleQuestionPattern.test(filename)
        if(isBook){
          continue;
        } else if (isChapter) {
          continue;
        } else if (isCommonAsked){
          continue;
        } else if (isQuestion){
          continue;
        } else {
          badFormat[filename] = 'no pattern'
        }

        if (index === files.length - 1) {
          console.log("Arquivos desformatados:", badFormat)
          return badFormat;
        }
      } catch (err) {
        console.warn(`Falha ao verificar padrão ${path}:`, err);
      }
    }
    
    console.log("não foi possível verificar seus arquivos.")
    return {}
  }

  async verifyFiles(): Promise<filesVerified> {
    const files = await this.fileProvider.listMarkdownFiles();
    const badFormat = {};

    for (const [index, path] of files.entries()){
      try {
        const content = await this.fileProvider.readFile(path);
        const filename = this.fileProvider.filenameOnly(path)
        let isBook = this.titleBookPattern.test(filename)
        let isChapter = this.titleBookPattern.test(filename)
        let isCommonAsked = this.titleBookPattern.test(filename)
        let isQuestion = this.titleBookPattern.test(filename)
        if(isBook){

        } else if (isChapter) {

        } else if (isCommonAsked){

        } else if (isQuestion){

        }
      } catch (err) {
        console.warn(`Falha ao verificar padrão ${path}:`, err);
      }
    }

    return badFormat
  }

  async verifyOneFile(path: string): Promise<string> {
    return "Não foi possível verificar o arquivo."
  }

  async onlyQuestionsTitle(): Promise<string[]>{
    const response = []
    const files = await this.fileProvider.listMarkdownFiles();
    for(const path of files){
      try {
        const filename = this.fileProvider.filenameOnly(path)
        let isQuestion = this.titleQuestionPattern.test(filename)
        if(isQuestion){
          response.push(path)
        }
      } catch(err){
        console.warn(`Falha ao retornar as questões ${path}`, err)
      }
    }
    
    return response
  }

  async onlyBooksTitle(): Promise<string[]>{
    const response = []
    const files = await this.fileProvider.listMarkdownFiles()
    for(const path of files){
      try {
        const filename = this.fileProvider.filenameOnly(path)
        let isBook = this.titleBookPattern.test(filename)
        if(isBook){
          response.push(path)
        }
      } catch (err){
        console.warn(`Falha ao retornar os livros de ${path}`, err)
      }
    }

    return response
  }

  async onlyChaptersTitle(){
    const response = []
    const files = await this.fileProvider.listMarkdownFiles()
    for(const path of files){
      try {
        const filename = this.fileProvider.filenameOnly(path)
        let is = this.titleChapterPattern.test(filename)
        if(is){
          response.push(path)
        }
      } catch (err){
        console.warn(`Falha ao retornar os capitulos de ${path}`, err)
      }
    }

    return response
  }

  async onlyCommonAskedTitle(){
    const response = []
    const files = await this.fileProvider.listMarkdownFiles()
    for(const path of files){
      try {
        const filename = this.fileProvider.filenameOnly(path)
        // const normalized = filename.normalize("NFC");
        let is = this.titleCommonAskedPattern.test(filename)
        if(is){
          response.push(path)
        }
      } catch (err){
        console.warn(`Falha ao retornar os questoes comuns de  de ${path}`, err)
      }
    }

    return response
  }

  async verifyUniqueQuestionsTitles(): Promise<string[]>{
    const response = []
    const titles = await this.onlyQuestionsTitle()
    const seen = new Set<string>()
    const titleRegex = /(P\d+\.\d+\s-\s.*?)(?=\s-\s)/
    for(const title of titles){
      try{
        
        const matchContent = title.match(titleRegex)
        const titleContent = matchContent?.[1]?.trim() || "not found"

        if(titleContent == "not found"){
          // console.log("este era o match content", matchContent)
          // console.log("este era o title", title)
          // await setTimeout(() => {}, 10000)
          response.push(title)
          continue
        }

        if(!seen.has(titleContent)){
          seen.add(titleContent)
        } else {
          response.push(titleContent)
        } 
      } catch(err){
        console.warn(`Falha ao retornar as contabilizar ${title}`, err)
      }
    }

    return response
  }

  async verifyUniqueBooksTitles(): Promise<string[]>{
    const response = []
    const titles = await this.onlyBooksTitle()
    const seen = new Set<string>()
    const titleRegex = /^(.+?)(?:\s*-\s*(\d+))?(?:\s*-\s*(.+))?$/
    for(const title of titles){
      try{
        
        const matchContent = title.match(titleRegex)
        const titleContent = matchContent?.[1]?.trim() || "not found"

        if(titleContent == "not found"){
          // console.log("este era o match content", matchContent)
          // console.log("este era o title", title)
          // await setTimeout(() => {}, 10000)
          response.push(title)
          continue
        }

        if(!seen.has(titleContent)){
          seen.add(titleContent)
        } else {
          response.push(title)
        } 
      } catch(err){
        console.warn(`Falha ao retornar as contabilizar ${title}`, err)
      }
    }

    return response
  }

  async verifyUniqueChaptersTitles(): Promise<string[]>{
    const response = []
    const titles = await this.onlyChaptersTitle()
    const seen = new Set<string>()
    const titleRegex = /./
    for(const title of titles){
      try{
        
        const matchContent = title.match(titleRegex)
        const titleContent = matchContent?.[1]?.trim() || "not found"

        if(titleContent == "not found"){
          // console.log("este era o match content", matchContent)
          // console.log("este era o title", title)
          // await setTimeout(() => {}, 10000)
          response.push(title)
          continue
        }

        if(!seen.has(titleContent)){
          seen.add(titleContent)
        } else {
          response.push(titleContent)
        } 
      } catch(err){
        console.warn(`Falha ao retornar as contabilizar ${title}`, err)
      }
    }

    return response
  }

  async badRegexFiles(): Promise<string[]>{
    const response = []
    const paths = await this.fileProvider.listMarkdownFiles()
    for (const path of paths){
      try{
        const filename = this.fileProvider.filenameOnly(path)
        let isBook = this.titleBookPattern.test(filename)
        let isQuestion = this.titleQuestionPattern.test(filename)
        let isChapter = this.titleChapterPattern.test(filename)
        let isCommonAsked = this.titleCommonAskedPattern.test(filename)

        let conditions = [isBook, isQuestion, isChapter, isCommonAsked]
        let qtdtrue =  conditions.filter(Boolean).length;

        if(qtdtrue > 2){
          response.push(path)
        }
      } catch {
        console.warn(`badRegexFiles: não foi possível availar ${path}`)
      }
    }
    return response
  }
}