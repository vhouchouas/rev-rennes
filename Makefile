check:
	for i in content/voies-cyclables/ligne-*json;do echo $$i; python -mjson.tool $$i >/dev/null ;echo $$?;done
