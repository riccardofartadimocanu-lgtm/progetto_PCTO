from flask import Flask, render_template
import os
 
app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), '..', 'src', 'ui', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'src', 'ui', 'static'))
 
@app.route("/")
def home():
    return render_template("pagina.html")
 
if __name__ == "__main__":
    app.run(debug=True)
 