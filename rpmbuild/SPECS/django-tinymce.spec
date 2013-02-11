Name:           django-tinymce
Version:        1.5.1b2
Release:        1%{?dist}
Summary:        TinyMCE editor for Django applications

Group:          Development/Libraries
License:        MIT
URL:            http://code.google.com/p/django-tinymce/
Source0:        http://django-tinymce.googlecode.com/files/%{name}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-devel
BuildRequires:  python-setuptools

%description
A Django application that render a form field as a TinyMCE editor.

%prep
%setup -q -n %{name}-%{version}
sed -i "s|\r||g" PKG-INFO


%build
CFLAGS="$RPM_OPT_FLAGS" %{__python} setup.py build


%install
%{__python} setup.py install --skip-build --root="$RPM_BUILD_ROOT"


%files
%doc docs/history.rst docs/index.rst docs/installation.rst docs/usage.rst LICENSE.txt README.txt PKG-INFO
%{python_sitelib}/tinymce/
%{python_sitelib}/testtinymce/
%{python_sitelib}/django_tinymce*.egg-info


%changelog
* Mon Feb 11 2013 Antonio Perez Aranda Alcaide <aperezaranda@yaco.es> - 1.5.1b2-1
- Upgrade upstream code to 1.5.1b2

* Fri Jan 13 2012 Fedora Release Engineering <rel-eng@lists.fedoraproject.org> - 1.5-3
- Rebuilt for https://fedoraproject.org/wiki/Fedora_17_Mass_Rebuild

* Fri Nov 25 2011 Yuguang Wang <yuwang@redhat.com> - 1.5-2
- Fix tarball checksum mismatch problem.

* Fri Sep 30 2011 Yuguang Wang <yuwang@redhat.com> - 1.5-1
- Remove spec file from source.

* Fri Aug 5 2011 Yuguang Wang <yuwang@redhat.com> - 1.5
- Initial RPM release
