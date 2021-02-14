//NOTE: In this file, we will bascially put all the variables that should be constants and should be reused across the project. And the goal of having this file with all these variables is that it will allow us to easily configure or project by simply changing some of the data that is here in this configuration file. So we don't need to search all configuration varaibles across multiple modules.

// NOTE: Using upper case here becuase this is a constant that will never change. So using upper case for that kind of variable is a common practice especially in a configuration file like this.
export const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/';

export const TIMEOUT_SEC = 10;

export const RES_PER_PAGE = 10;

export const API_KEY = 'f1149065-679b-43e0-9f6a-16f0e0985a5c';

export const MODAL_CLOSE_SEC = 2.5;
