package slug

import goslug "github.com/gosimple/slug"

func Generate(name string) string {
	return goslug.Make(name)
}
