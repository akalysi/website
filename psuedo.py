# do not run this, it is psuedo code for aesthetics on the website

class Gen:
    def __init__(self, type):
        pass
    def ideate(self, arg):
        pass

class Akalysi:
    def __init__(self):
        pass
    def settings(self, username=None, description=None):
        pass
    def init(self):
        pass
    def gen(self, type):
        return Gen(type)

akalysi = Akalysi()

akalysi.settings(username="akalysi", description="lizard programmer and esolanger")
akalysi.init()
gen = akalysi.gen(type="website")
gen.ideate("async:deploy")