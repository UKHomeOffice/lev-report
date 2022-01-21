DOCKER_IMAGE ?= lev-report
DOCKER_DB_IMAGE ?= lev-report-mock-db
postgres_hostname=localhost
postgres_port=5432
postgres_username=lev
postgres_password=lev
postgres_database=lev

psql_args=-h $(postgres_hostname) -p $(postgres_port) -d $(postgres_database) -U $(postgres_username)
psql=PGPASSWORD=$(postgres_password) psql $(psql_args)
pg_dump=PGPASSWORD=$(postgres_password) pg_dump $(psql_args)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

compose_project_name = $(current_dir)
compose_network_regexp != echo "$$(echo '$(compose_project_name)' | sed -E 's/([-_])+/[-_]*/g')_default"
probe_network = docker network ls | grep -o '$(compose_network_regexp)'

.PHONY: all clean deps docker docker-clean docker-test node-deps test unit-test db-shell

all: deps test docker

clean:
	rm -rf node_modules/

distclean: clean docker-compose-clean
	docker rmi -f '$(DOCKER_IMAGE)' || true

deps: node-deps

node-deps: node_modules/

node_modules/: package.json
	npm install

local-components: node-deps
	cd $(shell dirname $(current_dir))
	if [ ! -e "$(shell dirname $(shell pwd))/lev-react-components" ] ; then \
		echo 'ERROR: Please clone the necessary lev-react-components project in the parent directory' ; \
		exit 1 ; \
	fi
	rm -fr node_modules/lev-react-components/dist
	ln -s $(shell dirname $(shell pwd))/lev-react-components/dist node_modules/lev-react-components/dist

docker-compose-deps:
	docker-compose pull

docker-compose: docker-compose-deps docker docker-compose.yml
	docker-compose build

db-shell:
	$(psql)

docker:
	docker build -t '$(DOCKER_IMAGE)' .

docker-clean:
	docker rmi -f '$(DOCKER_IMAGE)'

docker-compose-clean:
	docker-compose stop
	docker-compose rm -vf

run: docker-compose-clean docker-compose
	docker-compose up

unit-test: node-deps
	npm test

test: unit-test
