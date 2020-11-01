import axios from "axios";
import { addCommands } from "./commandActions";
import store from "../store";
import isEmpty from "../../validation/is-empty";

export const addScript = (name) => (dispatch) => {
  const state = store.getState();
  let newScript = state.auth.accountScripts;
  axios
    .post("http://localhost:5000/api/scripts/addScript", { name })
    .then((res) => {
      newScript.push(res.data);
      dispatch({ type: "UPDATE_SCRIPT_LIST", payload: newScript });
    })
    .catch((err) => {
      if (err) throw err;
    });
};

export const saveScript = (script = {}, id) => (dispatch) => {
  if (isEmpty(id)) {
    let state = store.getState();
    id = state.script.currentScript;
  }
  axios.post("http://localhost:5000/api/scripts/updateScript", { script, id }).catch((err) => {
    if (err) throw err;
  });
};

export const renameScript = (name, id) => (dispatch) => {
  dispatch({ type: "UPDATE_SCRIPT_NAME", payload: name });
  dispatch(saveScript({ name }, id));
};

export const executeScript = (id) => (dispatch) => {
  dispatch({ type: "CLEAR_GENERATED_VARIABLES" });
  axios
    .post("http://localhost:5000/api/scripts/executeScript", { id })
    .then((res) => {
      dispatch({ type: "SET_GENERATED_VARIABLES", payload: res.data.variables });
      dispatch({ type: "SET_POPUP_TYPE", payload: "" });
    })
    .catch((err) => {
      if (err) throw err;
    });
};

export const queryScripts = () => (dispatch) => {
  axios.post("http://localhost:5000/api/scripts/getAccountScripts").then((res) => {
    dispatch({ type: "UPDATE_SCRIPT_LIST", payload: res.data });
  });
};

export const getScript = (id) => (dispatch) => {
  axios.post("http://localhost:5000/api/scripts/getScript", { id }).then((res) => {
    dispatch({ type: "UPDATE_CURRENT_SCRIPT", payload: id });
    dispatch({ type: "UPDATE_SCRIPT_NAME", payload: res.data.name });
    dispatch({ type: "SET_VARIABLES", payload: res.data.variables });
    dispatch(addCommands(res.data.commands));
  });
};

export const deleteScript = (id, index) => (dispatch) => {
  const state = store.getState();
  let newScript = state.auth.accountScripts;
  axios
    .post("http://localhost:5000/api/scripts/deleteScript", { id })
    .then(() => {
      newScript.splice(index, 1);
      dispatch({ type: "UPDATE_SCRIPT_LIST", payload: newScript });
    })
    .catch((err) => {
      if (err) throw err;
    });
};

export const clearCurrentScript = () => (dispatch) => {
  dispatch({ type: "UPDATE_CURRENT_SCRIPT", payload: "" });
  dispatch({ type: "UPDATE_COMMAND_LIST", payload: [] });
  dispatch({ type: "UPDATE_COMMAND_JSON", payload: [] });
};

export const deleteVariable = (name, generated = 0, index) => (dispatch) => {
  const state = store.getState();
  if (generated) {
    let newGenVars = state.script.generated;
    newGenVars.splice(index, 1);
    dispatch({ type: "SET_GENERATED_VARIABLES", payload: newGenVars });
  } else {
    axios
      .post(`http://localhost:5000/api/scripts/variableDelete/${state.script.currentScript}/${name}`, { generated })
      .then(() => {
        let newVariables = state.script.variables;
        newVariables.splice(index, 1);
        dispatch({ type: "SET_VARIABLES", payload: newVariables });
        dispatch(saveScript({ variables: newVariables }, state.script.currentScript));
      })
      .catch((err) => {
        if (err) throw err;
      });
  }
};
export const uploadVariable = (file) => (dispatch) => {
  const state = store.getState();
  let newVariables = state.script.variables;
  let config = { headers: { "Content-Type": "multipart/form-data" } };
  let fd = new FormData();
  fd.append("file", file);
  axios
    .post("http://localhost:5000/api/scripts/variable/" + state.script.currentScript + "/" + file.name, fd, config)
    .then(() => {
      newVariables.push({ type: "uploaded", name: file.name });
      dispatch({ type: "SET_VARIABLES", payload: newVariables });
    })
    .catch((err) => {
      if (err) throw err;
    });
};
