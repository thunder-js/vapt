const isPromise = thing => thing instanceof Promise

const buildStartAction = type => ({
  type,
})

const buildSuccessAction = (type, data) => ({
  type,
  payload: data,
})

const buildErrorAction = (type, error) => ({
  type,
  error,
})

const defaultConfig = {
  startTypeGetter: action => `${action.type}_START`,
  successTypeGetter: action => `${action.type}_SUCCESS`,
  errorTypeGetter: action => `${action.type}_ERROR`,
}
export const middlewareCreator = userConfig => store => next => (action) => {
  const { payload } = action
  const config = {
    ...defaultConfig,
    userConfig,
  }

  if (isPromise(payload)) {
    const type = config.startTypeGetter(action)
    store.dispatch(buildStartAction(type, action))
    return payload.then((data) => {
      const successType = config.successTypeGetter(action)
      store.dispatch(buildSuccessAction(successType, data))
      return data
    })
      .catch((error) => {
        const errorType = config.errorTypeGetter(action)
        store.dispatch(buildErrorAction(errorType, error))
        throw error
      })
  }
  next(action)
}
