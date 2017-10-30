# request-merge
Lot of occurrences, when client raise a http request to the same url. Maybe client gets a few notifications, or maybe user clicks a button crazily in a short time. For instance, if 10 http requests were raised at almost the same time, actaully, these 10 http requests can be merged together: doing a single http request.
