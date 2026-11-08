import { cutil } from "@ghasemkiani/base";
import { Obj } from "@ghasemkiani/base";

class Ollama extends Obj {
  static {
    cutil.extend(this.prototype, {
      urlDefault: "http://localhost:11434",
      modelDefault: "gemma4:cloud",
      _url: null,
      _model: null,
      system: "",
      log: null,
    });
  }
  get url() {
		if (cutil.na(this._url)) {
			this._url = process.env["OLLAMA_HOST"] || this.urlDefault;
		}
		return this._url;
	}
	set url(url) {
		this._url = url;
	}
  get model() {
		if (cutil.na(this._model)) {
			this._model = process.env["OLLAMA_MODEL"] || this.modelDefault;
		}
		return this._model;
	}
	set model(model) {
		this._model = model;
	}
  async toGenerate(prompt) {
    const agent = this;
    const { url } = agent;
    const { model } = agent;
    const { system } = agent;
    
    const rsp = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        stream: false
      }),
    });

    if (!rsp.ok) {
      const errorText = await rsp.text();
      throw new Error(`Ollama API error (${rsp.status}): ${errorText}`);
    }

    const data = await rsp.json();
    const response = data.message?.content || "";

    agent.assign({ log: { data, model, response } });
    return response;
  }
}

export { Ollama };
