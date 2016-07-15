import requests

url = 'https://graph.facebook.com/me/invitable_friends?pretty=0&limit=5000&access_token='

#t = 'EAACEdEose0cBAJxzgICowgdkuGO6xHS2IZCcmq1PEvlzhAoZB0DD2hfBAMmWPVuY7FhTGZCc52VypVYcdUnZCUvYgtR45FHlGpeojijMkfdYc7JoBUczYMccbfYfxxQr9wuKCLXwFZCTZBOfhWGnr2Awm51CuhuzMbyhKeOrhXWwZDZD'


r = requests.get(url+raw_input())
print r.text
