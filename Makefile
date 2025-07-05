check:
	for i in content/voies-cyclables/ligne-*json;do echo $$i; python -mjson.tool $$i >/dev/null ;echo $$?;done || :
	grep type content/voies-cyclables/ligne-*.json|sed -e 's!.*json!!' |sort -u
