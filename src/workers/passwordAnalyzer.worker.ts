import zxcvbn from 'zxcvbn'
import { analyzePassword, type PasswordAnalysis } from '../lib/passwordAnalysis'

interface AnalysisRequest {
  requestId: number
  password: string
}

interface AnalysisResponse {
  requestId: number
  analysis?: PasswordAnalysis
  error?: string
}

interface AnalysisWorkerScope {
  addEventListener(type: 'message', listener: (event: MessageEvent<AnalysisRequest>) => void): void
  postMessage(message: AnalysisResponse): void
}

const workerScope = self as unknown as AnalysisWorkerScope

workerScope.addEventListener('message', ({ data }) => {
  try {
    workerScope.postMessage({
      requestId: data.requestId,
      analysis: analyzePassword(data.password, zxcvbn(data.password)),
    })
  } catch {
    workerScope.postMessage({ requestId: data.requestId, error: 'analysis-failed' })
  }
})
