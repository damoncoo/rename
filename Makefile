PROJECT := ${project}
OLD_PREFIX := ${old}
NEW_PREFIX := ${new}

image:
	@echo ${PROJECT}
	@echo ${OLD_PREFIX}
	@echo ${NEW_PREFIX}	

	node start.js images ${PROJECT} -o ${OLD_PREFIX} -n ${NEW_PREFIX}
	node start.js assets ${PROJECT} -o ${OLD_PREFIX} -n ${NEW_PREFIX}

class:
	@echo ${PROJECT}
	@echo ${OLD_PREFIX}
	@echo ${NEW_PREFIX}	
	node start.js classes ${PROJECT} -o ${OLD_PREFIX} -n ${NEW_PREFIX}

